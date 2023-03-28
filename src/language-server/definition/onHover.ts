import { Connection, Hover, MarkupContent, MarkupKind, Range } from 'vscode-languageserver/browser';
import { Context } from '../context';
import { astTypes, nodeToString, visit, visitEnter } from '../utils';

type OnHover = Parameters<Connection['onHover']>[0];

export const onHover =
  (ctx: Context): OnHover =>
  async ({ textDocument, position }) => {
    const uri = textDocument.uri;
    const document = ctx.documents.get(uri);
    const solidity = ctx.documentMap.get(uri);

    if (!uri || !document || !document.offsetAt || !solidity) {
      return null;
    }

    const offset = document.offsetAt(position) ?? 0;

    const targetHovers: Hover[] = [];
    const getRange = (n: astTypes.ASTNode): Range | undefined => {
      const [s, e] = n.range ?? [0, 0];
      if (offset >= s && offset <= e) {
        return {
          start: document.positionAt(s),
          end: document.positionAt(e),
        };
      }
      return undefined;
    };
    const getCommonContent = (n: astTypes.ASTNode): MarkupContent => {
      const comment = n.type.replace(/([A-Z])/g, ' $1').trim();
      return {
        kind: MarkupKind.Markdown,
        value: [comment, '```solidity', nodeToString(n), '```'].join('\n'),
      };
    };
    const commonVisitor = (n: astTypes.ASTNode) => {
      const range = getRange(n);
      if (range) {
        const contents = getCommonContent(n);
        targetHovers.push({ range, contents });
      }
    };

    visit(solidity.ast, {
      // directive
      PragmaDirective: commonVisitor,
      ImportDirective: commonVisitor,
      // definition
      ContractDefinition: commonVisitor,
      StructDefinition: commonVisitor,
      ModifierDefinition: commonVisitor,
      FunctionDefinition: commonVisitor,
      EventDefinition: commonVisitor,
      CustomErrorDefinition: commonVisitor,
      EnumDefinition: commonVisitor,
      LabelDefinition: commonVisitor,
      TypeDefinition: commonVisitor,
      // declaration
      StateVariableDeclaration: commonVisitor,
      VariableDeclaration: commonVisitor,
    });

    return targetHovers[targetHovers.length - 1] ?? null;
  };
