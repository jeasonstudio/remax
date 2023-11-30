import { createDebug } from '@remax-ide/common/debug';
import { Connection, Hover, MarkupContent, MarkupKind } from 'vscode-languageserver/browser';
import { Context } from '../context';
import { ASTNodeFilter, astTypes, matches } from '../utils/parser';
import { node2string } from '../utils/node';
import { globallyList } from '../globally';

const debug = createDebug('extension:language-server:onHover');

type OnHover = Parameters<Connection['onHover']>[0];

export const onHover =
  (ctx: Context): OnHover =>
  async ({ textDocument, position }) => {
    // 1. 获取 documents
    const document = ctx.documents.get(textDocument.uri);
    if (!document) return null;

    // 2. 根据 position 获取 target node 和 parent node
    const [target, parent] = document.getNodeAt(position);
    const range = document.getNodeRange(target);
    debug(
      `target@L${range.start.line}:${range.start.character}-L${range.end.line}:${range.end.character}`,
      target,
      parent,
    );

    // 3. 判断是否为全局变量或方法
    const globallyItem = globallyList.find((item) =>
      item.filter ? matches(item.filter)(target, parent) : false,
    );

    if (globallyItem) {
      return {
        range,
        contents: {
          kind: MarkupKind.Markdown,
          value: `\`\`\`solidity\n(global) ${globallyItem.detail}\n\`\`\`  \n${
            globallyItem.documentation
          }${globallyItem.url ? ` [view document](${globallyItem.url})` : ''}`,
        },
      };
    }

    // 4. 其他情况
    const getContent = (c: string[]): MarkupContent => ({
      kind: MarkupKind.Markdown,
      value: ['```solidity', ...c, '```'].join('\n'),
    });

    const getHover = (n: astTypes.ASTNode, c: string[]): Hover => ({
      range: document.getNodeRange(n),
      contents: getContent(c),
    });

    const getDefaultHover = () => getHover(target, [node2string(target)]);

    const universal: [ASTNodeFilter, Hover][] = [
      // import "xxx";
      [{ type: 'ImportDirective' }, getDefaultHover()],
      // vars
      [
        { type: 'VariableDeclaration' },
        getHover(target, [
          ((target as any)?.isStateVar ? '(state variable) ' : '(local variable) ') +
            node2string(target),
        ]),
      ],
      [
        { parentFilter: { type: 'VariableDeclaration' } },
        getHover(parent, [
          ((parent as any)?.isStateVar ? '(state variable) ' : '(local variable) ') +
            node2string(parent),
        ]),
      ],
      // contract Foo {}
      [{ type: 'ContractDefinition' }, getDefaultHover()],
      [{ type: 'FunctionDefinition' }, getDefaultHover()],
      [{ type: 'PragmaDirective' }, getDefaultHover()],
      // contract xxx is Foo {}
      [
        { type: 'UserDefinedTypeName', parentFilter: { type: 'InheritanceSpecifier' } },
        getHover(target, [`interface ${(target as any).namePath} {}`]),
      ],
    ];

    const universalItem = universal.find(([f]) => matches(f)(target, parent))?.[1];

    if (universalItem) return universalItem;

    return null;
  };
