import { Connection, Location } from 'vscode-languageserver/browser';
import { Context } from '../context';
import { astTypes } from '../utils/parser';
// import { astTypes, tokenize, visit, definitionVisitors } from '../utils';

type OnDefinition = Parameters<Connection['onDefinition']>[0];

export const onDefinition =
  (ctx: Context): OnDefinition =>
  async ({ textDocument, position }) => {
    const document = ctx.documents.get(textDocument.uri);
    if (!document) return null;

    const node = document.getNodeAt(position, ['ImportDirective', 'Identifier']);
    console.log('onDefinition node', node);

    const getLocation = (n: astTypes.ASTNode): Location => {
      switch (n?.type) {
        case 'ImportDirective':
          return Location.create(document.resolveUri(n.path).toString(), {
            start: document.positionAt(0),
            end: document.positionAt(0),
          });
        case 'Identifier':
          const reference = document.getIdentifierReferenceNode(n);
          if (!reference) return null;
          return Location.create(document.uri, {
            start: document.positionAt(reference.range[0]),
            end: document.positionAt(reference.range[1] + 1),
          });
        default:
          return null;
      }
    };

    return getLocation(node);
  };
