import { CompletionItemKind, CompletionList, Location } from 'vscode-languageserver/browser';
import { FOnDefinition } from '../types';

export const onDefinition: FOnDefinition = (_state) => async (params) => {
  const uri = params.textDocument.uri;
  const textDocument = _state.documents.get(uri);
  const ast = _state.ast.get(uri);
  const tokens = _state.tokens.get(uri);
  const position = params.position;
  const offset = textDocument?.offsetAt?.(position) ?? 0;
  // const triggerCharacter = params.context?.triggerCharacter || '(';

  if (!ast || !textDocument || !tokens?.length) {
    return null;
  }

  const token = _state.getOffsetToken(textDocument, offset);
  const variableName = token?.value;

  if (!variableName) {
    return null;
  }

  const targets = tokens.filter((t) => t.value === variableName);

  if (!targets?.length) {
    return null;
  }

  // TODO
  const locations = targets.map((target) =>
    Location.create(uri, {
      start: textDocument.positionAt(target.range![0]),
      end: textDocument.positionAt(target.range![1]),
    }),
  );

  return locations;
};
