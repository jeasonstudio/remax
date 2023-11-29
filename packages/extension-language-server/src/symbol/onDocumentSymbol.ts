import { Connection, DocumentSymbol, SymbolKind } from 'vscode-languageserver/browser';
import { Context } from '../context';
import { astTypes, visit, visitEnter } from '../utils/parser';

type OnDocumentSymbol = Parameters<Connection['onDocumentSymbol']>[0];

export const onDocumentSymbol =
  (ctx: Context): OnDocumentSymbol =>
  async ({ textDocument }) => {
    const document = ctx.documents.get(textDocument.uri);
    if (!document) return null;

    // const contracts = document.contracts;

    // visitEnter(document.ast, (node) => {
    //   console.log('onDocumentSymbol node', node);
    // });

    const getContractSymbols = (cNode: astTypes.ContractDefinition): DocumentSymbol[] => {
      const list: DocumentSymbol[] = [];
      visit(cNode, {
        VariableDeclaration: (n) => {
          if (!n.isStateVar) return;
          const range = document.getNodeRange(n);
          const symbolItem: DocumentSymbol = {
            name: n.name || 'unknown',
            kind: SymbolKind.Field,
            range,
            selectionRange: range,
          };
          list.push(symbolItem);
        },
        FunctionDefinition: (n, parentNode) => {
          if (parentNode.type !== 'ContractDefinition') return;
          const range = document.getNodeRange(n);
          const symbolItem: DocumentSymbol = {
            name: n.isConstructor ? 'constructor' : n.name || 'unknown',
            kind: n.isConstructor ? SymbolKind.Constructor : SymbolKind.Method,
            range,
            selectionRange: range,
          };
          list.push(symbolItem);
        },
      });
      return list;
    };

    return document.contracts.map((cNode) => {
      const range = document.getNodeRange(cNode);
      const symbolItem: DocumentSymbol = {
        name: cNode.name,
        kind: cNode.kind === 'contract' ? SymbolKind.Class : SymbolKind.Interface,
        range,
        selectionRange: range,
        children: getContractSymbols(cNode),
      };
      return symbolItem;
    });
  };
