import { CompletionItemKind, CompletionList } from 'vscode-languageserver/browser';
import { FOnCompletion } from '../types';
// import { defaultCompletion, globalVariables } from './defaults';
import { getSuperCompletions } from './getSuperCompletion';
import { getThisCompletions } from './getThisCompletion';
import { getGlobalCompletionsByKeyword, globalVariables } from './globals';

export const onCompletion: FOnCompletion = (_state) => async (_textDocumentPosition) => {
  const result: CompletionList = { isIncomplete: true, items: [] };
  const uri = _textDocumentPosition.textDocument.uri;
  const textDocument = _state.documents.get(uri);
  const position = _textDocumentPosition.position;
  const offset = textDocument?.offsetAt?.(position) ?? 0;
  const triggerCharacter = _textDocumentPosition.context?.triggerCharacter || '.';
  const content = textDocument?.getText?.() || '';

  // const leadingText = textDocument?.getText({
  //   start: { line: position.line, character: position.character - 3 },
  //   end: { line: position.line, character: position.character },
  // });

  // if (leadingText === '///' || _textDocumentPosition?.context?.triggerCharacter === '*') {
  //   // TODO: add solidity doc snippets
  //   result.items = [];
  // }

  if (!textDocument?.getText) {
    return result;
  }

  // such as: `this.` keyword `this`'s offset should -1
  const keywordOffset = offset - triggerCharacter.length;
  const token = _state.getOffsetToken(textDocument, keywordOffset);

  // Trigger by '.'
  if (triggerCharacter === '.') {
    if (token?.value === 'this') {
      // this.
      const completions = getThisCompletions(_state, uri, keywordOffset);
      result.items.push(...completions);
    } else if (token?.value === 'super') {
      // super.
      const completions = getSuperCompletions(_state, uri, keywordOffset);
      result.items.push(...completions);
    } else if (globalVariables.includes(token?.value ?? '')) {
      // abi./msg.
      const completions = getGlobalCompletionsByKeyword(token?.value);
      result.items.push(...completions);
    } else {
      const completions = getGlobalCompletionsByKeyword();
      result.items.push(...completions);
    }
  }

  return result;
};
