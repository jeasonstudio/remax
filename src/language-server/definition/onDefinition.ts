import { TextDocument } from 'vscode-languageserver-textdocument';
import { CompletionItemKind, CompletionList, Connection, Location } from 'vscode-languageserver/browser';
import { Context } from '../context';
import { FOnDefinition } from '../types';
import { astTypes, tokenize, visit, definitionVisitors } from '../utils';

type OnDefinition = Parameters<Connection['onDefinition']>[0];

export const onDefinition =
  (ctx: Context): OnDefinition =>
  async ({ textDocument, position }) => {
    const uri = textDocument.uri;
    const document = ctx.documents.get(uri);

    if (!document) return null;

    // Line text before the trigger character(not including the trigger character)
    const lineText = document.getText({
      start: { line: position.line, character: 0 },
      end: { line: position.line, character: Number.MAX_SAFE_INTEGER },
    });

    // // Line text tokens
    const tokens = tokenize(lineText);
    const token = tokens.find((t) => {
      const [start, end] = t.range ?? [0, 0];
      return position.character >= start && position.character <= end;
    });

    if (!token) return null;

    const importList = ctx.getImportsList(uri);
    const soliditys = [uri, ...importList];

    const locations: Location[] = [];

    for (let index = 0; index < soliditys.length; index += 1) {
      const solidityUri = soliditys[index];
      const currentDocument = ctx.documents.get(solidityUri);

      if (!currentDocument) continue;

      const node2Location = (n: astTypes.ASTNode) => {
        return Location.create(solidityUri, {
          start: currentDocument.positionAt(n.range![0]),
          end: currentDocument.positionAt(n.range![1] + 1), // TODO: donot know why should add 1
        });
      };
      const isNotCurrent = (n: astTypes.ASTNode) => {
        const [start, end] = token.range ?? [0, 0];
        if (solidityUri !== uri) {
          // Not same file means not same token
          return true;
        }
        return (n.range![0] < start && n.range![1] <= start) || (n.range![0] >= end && n.range![1] >= end);
      };

      const visitors = Object.fromEntries(
        definitionVisitors.map((v) => [
          v,
          (n: astTypes.ASTNode) => {
            if ((n as any)?.name === token.value && isNotCurrent(n)) {
              locations.push(node2Location(n));
            }
          },
        ]),
      );
      currentDocument.visit(visitors);
    }

    return locations.length ? locations : null;
  };
