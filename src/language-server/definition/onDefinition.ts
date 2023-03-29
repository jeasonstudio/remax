import { TextDocument } from 'vscode-languageserver-textdocument';
import { CompletionItemKind, CompletionList, Connection, Location } from 'vscode-languageserver/browser';
import { Context } from '../context';
import { FOnDefinition } from '../types';
import { astTypes, tokenize, visit } from '../utils';

type OnDefinition = Parameters<Connection['onDefinition']>[0];

export const onDefinition =
  (ctx: Context): OnDefinition =>
  async ({ textDocument, position }) => {
    const uri = textDocument.uri;
    const document = ctx.documents.get(uri);
    const solidity = ctx.documentMap.get(uri);

    if (!uri || !document || !document.offsetAt || !solidity) {
      return null;
    }

    const offset = document.offsetAt(position) ?? 0;

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

    if (!token) {
      return null;
    }

    const importList = ctx.getImportsList(uri);
    const soliditys = [uri, ...importList];

    const locations: Location[] = [];

    for (let index = 0; index < soliditys.length; index++) {
      const solidityUri = soliditys[index];
      const doc = ctx.documentMap.get(solidityUri);
      if (!doc || !doc.ast) {
        continue;
      }
      const textDocument = TextDocument.create(solidityUri, 'solidity', 1, doc.content);
      const node2Location = (n: astTypes.ASTNode) => {
        return Location.create(solidityUri, {
          start: textDocument.positionAt(n.range![0]),
          end: textDocument.positionAt(n.range![1] + 1), // TODO: donot know why should add 1
        });
      };
      visit(doc.ast, {
        ContractDefinition: (n) => {
          n.name === token.value && locations.push(node2Location(n));
        },
        StructDefinition: (n) => {
          n.name === token.value && locations.push(node2Location(n));
        },
        ModifierDefinition: (n) => {
          n.name === token.value && locations.push(node2Location(n));
        },
        FunctionDefinition: (n) => {
          n.name === token.value && locations.push(node2Location(n));
        },
        EventDefinition: (n) => {
          n.name === token.value && locations.push(node2Location(n));
        },
        CustomErrorDefinition: (n) => {
          n.name === token.value && locations.push(node2Location(n));
        },
        EnumDefinition: (n) => {
          n.name === token.value && locations.push(node2Location(n));
        },
        VariableDeclaration: (n) => {
          n.name === token.value && locations.push(node2Location(n));
        },
        UserDefinedTypeName: (n) => {
          n.namePath === token.value && locations.push(node2Location(n));
        },
        LabelDefinition: (n) => {
          n.name === token.value && locations.push(node2Location(n));
        },
      });
    }

    return locations.length ? locations : null;
  };
