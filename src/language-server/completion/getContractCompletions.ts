import { CompletionItem, CompletionItemKind, URI } from 'vscode-languageserver/browser';
import { ASTNode, ContractDefinition, IState } from '../types';
import { astTypes, nodeToString, parser, visit } from '../utils';

/**
 * Completion for `this` keyword
 * @param contracts ContractDefinition Nodes
 * @returns completion list
 */
export const getContractCompletions = (
  contracts?: Array<astTypes.ContractDefinition | undefined>,
): CompletionItem[] => {
  if (!contracts?.length) {
    return [];
  }
  const completionMap: Record<string, CompletionItem> = {};

  for (let index = 0; index < contracts.length; index += 1) {
    const contract = contracts[index];
    if (!contract?.name) {
      continue;
    }
    visit(contract, {
      StateVariableDeclaration: (n) => {
        const name = n?.variables?.[0]?.identifier?.name;
        if (name) {
          completionMap[name] = {
            label: name,
            kind: CompletionItemKind.Field,
            detail: nodeToString(n),
          };
        }
      },
      FunctionDefinition: (n) => {
        const name = n?.name;
        if (name) {
          completionMap[name] = {
            label: name,
            kind: CompletionItemKind.Function,
            detail: nodeToString(n),
          };
        }
      },
    });
  }

  return Object.values(completionMap);
};
