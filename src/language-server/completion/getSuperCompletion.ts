import { CompletionItem, CompletionItemKind, URI } from 'vscode-languageserver/browser';
import { ASTNode, IState } from '../types';
import { nodeToString } from '../utils';
import { getThisCompletions } from './getThisCompletion';

/**
 * Completion for `super` keyword
 * @param keyworkOffset this keyword offset in document
 * @returns completion list
 */
export function getSuperCompletions(_state: IState, uri: URI, keyworkOffset: number): CompletionItem[] {
  const ast = _state.ast.get(uri);
  if (!ast) {
    return [];
  }

  // TODO: not implemented yet
  const completions: CompletionItem[] = getThisCompletions(_state, uri, keyworkOffset);

  return completions;
}
