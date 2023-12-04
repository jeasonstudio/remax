import { Connection, DocumentSymbol, SymbolKind } from 'vscode-languageserver/browser';
import { Context } from '../context';
import { ASTContract, ASTContractKind } from '../text-document/ast';
import { astTypes } from '../utils/parser';

type OnDocumentSymbol = Parameters<Connection['onDocumentSymbol']>[0];

export const onDocumentSymbol =
  (ctx: Context): OnDocumentSymbol =>
  async ({ textDocument }) => {
    const document = ctx.documents.get(textDocument.uri);
    if (!document) return null;

    const getContractSymbols = (contract: ASTContract): DocumentSymbol[] => {
      const list: DocumentSymbol[] = [];

      const subNodes = contract.ast?.subNodes || [];
      for (let index = 0; index < subNodes.length; index += 1) {
        const node = subNodes[index] as astTypes.ASTNode;
        const range = document.getNodeRange(node);

        switch (node.type) {
          case 'FunctionDefinition':
            if (node.isConstructor) {
              list.push({
                name: 'constructor',
                kind: SymbolKind.Constructor,
                range,
                selectionRange: range,
              });
            } else if (node.isFallback) {
              list.push({
                name: 'fallback',
                kind: SymbolKind.Property,
                range,
                selectionRange: range,
              });
            } else if (node.isReceiveEther) {
              list.push({
                name: 'receive',
                kind: SymbolKind.Property,
                range,
                selectionRange: range,
              });
            } else {
              list.push({
                name: node.name || 'function(unknown)',
                kind: SymbolKind.Method,
                range,
                selectionRange: range,
              });
            }
            break;
          case 'ModifierDefinition':
            list.push({
              name: node.name || 'modifier(unknown)',
              kind: SymbolKind.Operator,
              range,
              selectionRange: range,
            });
            break;
          case 'StateVariableDeclaration':
            node.variables.forEach((variable) => {
              list.push({
                name: variable.name || 'state_variable(unknown)',
                kind: SymbolKind.Field,
                range,
                selectionRange: range,
              });
            });
            break;
          case 'StructDefinition':
            list.push({
              name: node.name || 'struct(unknown)',
              kind: SymbolKind.Struct,
              range,
              selectionRange: range,
            });
            break;
          case 'EnumDefinition':
            list.push({
              name: node.name || 'enum(unknown)',
              kind: SymbolKind.Enum,
              range,
              selectionRange: range,
            });
            break;
          case 'UserDefinedTypeName':
            list.push({
              name: node.namePath || 'type(unknown)',
              kind: SymbolKind.TypeParameter,
              range,
              selectionRange: range,
            });
            break;
          case 'EventDefinition':
            list.push({
              name: node.name || 'event(unknown)',
              kind: SymbolKind.Event,
              range,
              selectionRange: range,
            });
            break;
          case 'CustomErrorDefinition':
            list.push({
              name: node.name || 'error(unknown)',
              kind: SymbolKind.Key,
              range,
              selectionRange: range,
            });
            break;
          default:
        }
      }

      return list;
    };

    const kindMap: Record<ASTContractKind, SymbolKind> = {
      [ASTContractKind.Contract]: SymbolKind.Class,
      [ASTContractKind.Interface]: SymbolKind.Interface,
      [ASTContractKind.Library]: SymbolKind.Package,
    };

    return document.contracts.map((contract) => {
      const range = document.getNodeRange(contract.ast);
      const symbolItem: DocumentSymbol = {
        name: contract.name,
        kind: kindMap[contract.kind],
        range,
        selectionRange: range,
        children: getContractSymbols(contract),
      };
      return symbolItem;
    });
  };
