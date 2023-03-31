import { Connection, Hover, MarkupContent, MarkupKind, Range } from 'vscode-languageserver/browser';
import { Context } from '../context';
import { astTypes, nodeToString, parserTypes, tokenize, visit, visitEnter } from '../utils';

type OnHover = Parameters<Connection['onHover']>[0];

export const onHover =
  (ctx: Context): OnHover =>
  async ({ textDocument, position }) => {
    const uri = textDocument.uri;
    const document = ctx.documents.get(uri);

    if (!document) return null;

    const offset = document.offsetAt(position) ?? 0;

    const textBeforeCurrentLine = document.getText({
      start: { line: 0, character: 0 },
      end: { line: position.line - 1, character: Number.MAX_SAFE_INTEGER },
    });

    // // Line text tokens
    const tokens = tokenize(textBeforeCurrentLine);
    const comments: string[] = [];
    for (let index = tokens.length - 1; index > 0; index -= 1) {
      const token = tokens[index];
      if (token.type === 'Keyword' && token.value?.startsWith('//')) {
        const value = token.value.replace(/^\/\/\s*/, '');
        comments.unshift(value);
      } else if (token.type === 'Keyword' && token.value?.startsWith('/*')) {
        const multipeValues = token.value.split('\n').map((line) => {
          const value = line
            .trim()
            .replace(/^\/\*\s*/, '')
            .replace(/\s*\*\/$/, '')
            .replace(/^\*\s*/, '');
          return value;
        });
        comments.unshift(...multipeValues);
      } else {
        break;
      }
    }

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
      // const comment = n.type.replace(/([A-Z])/g, ' $1').trim();
      const comment = comments.join('  \n');
      const nodeString = ['```solidity', nodeToString(n), '```'].join('\n');
      return {
        kind: MarkupKind.Markdown,
        value: [comment, nodeString].join('  \n'),
      };
    };
    const commonVisitor = (n: astTypes.ASTNode) => {
      const range = getRange(n);
      if (range) {
        const contents = getCommonContent(n);
        targetHovers.push({ range, contents });
      }
    };

    document.visit({
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
