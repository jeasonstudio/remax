import { CompletionItemKind, CompletionList } from 'vscode-languageserver/browser';
import { FOnSignatureHelp } from '../types';
import { getDefinitionNodes } from '../utils';

export const onSignatureHelp: FOnSignatureHelp = (_state) => async (params) => {
  const uri = params.textDocument.uri;
  const textDocument = _state.documents.get(uri);
  const ast = _state.ast.get(uri);
  const position = params.position;
  const offset = textDocument?.offsetAt?.(position) ?? 0;
  const triggerCharacter = params.context?.triggerCharacter || '(';

  if (!ast) {
    return null;
  }

  // such as: `this.` keyword `this`'s offset should -1
  const keywordOffset = offset - triggerCharacter.length;
  const defs = getDefinitionNodes(ast, offset);
  console.log('definition nodes', defs);

  return null;
};
