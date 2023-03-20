import { CompletionItem, CompletionItemKind } from 'vscode-languageserver/browser';

const types = ['public', 'private', 'external', 'internal'];

// keywords
export const keywords: Record<string, string[]> = Object.fromEntries(types.map((t) => [t, []]));
// mapping(keyword => completion)
export const completions: Record<string, CompletionItem> = Object.fromEntries(
  types.map((t) => [
    t,
    {
      label: t,
      kind: CompletionItemKind.Keyword,
      detail: t,
    },
  ]),
);
