import { CompletionItemKind, CompletionList, Location, MarkupContent, MarkupKind } from 'vscode-languageserver/browser';
import { FOnHover } from '../types';
import { getNodeByOffset, nodeToString } from '../utils';

export const onHover: FOnHover = (_state) => async (params) => {
  const uri = params.textDocument.uri;
  const textDocument = _state.documents.get(uri);
  const ast = _state.ast.get(uri);
  const tokens = _state.tokens.get(uri);
  const position = params.position;
  const offset = textDocument?.offsetAt?.(position) ?? 0;

  if (!ast || !textDocument || !tokens?.length) {
    return null;
  }

  const target = getNodeByOffset(ast, offset);

  if (!target) {
    return null;
  }
  const text = nodeToString(target);

  if (!text) {
    return null;
  }

  return {
    contents: {
      kind: MarkupKind.Markdown,
      value: ['```solidity', text, '```'].join('\n'),
    },
    range: {
      start: textDocument.positionAt(target.range![0]),
      end: textDocument.positionAt(target.range![1]),
    },
  };
};
