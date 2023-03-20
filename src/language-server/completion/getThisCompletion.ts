import { CompletionItem, CompletionItemKind, URI } from 'vscode-languageserver/browser';
import { ASTNode, IState } from '../types';
import { nodeToString, parser } from '../utils';

/**
 * Completion for `this` keyword
 * @param keyworkOffset this keyword offset in document
 * @returns completion list
 */
export function getThisCompletions(_state: IState, uri: URI, keyworkOffset: number): CompletionItem[] {
  const ast = _state.ast.get(uri);
  if (!ast) {
    return [];
  }

  const completions: CompletionItem[] = [];

  let contractName = '';
  const contractRange = [0, 0];
  parser.visit(ast, {
    ContractDefinition: (node) => {
      const [start, end] = node.range || [0, 0];
      if (start <= keyworkOffset && end >= keyworkOffset) {
        contractRange[0] = start;
        contractRange[1] = end;
        contractName = node.name;
      }
    },
  });

  parser.visit(ast, {
    FunctionDefinition: (node) => {
      const [start, end] = node.range || [0, 0];
      if (start >= contractRange[0] && end <= contractRange[1] && node.name) {
        const detail = nodeToString(node);
        completions.push({
          label: node.name,
          kind: CompletionItemKind.Function,
          detail: detail,
          // documentation: detail,
        });
      }
    },
  });
  return completions;
}
