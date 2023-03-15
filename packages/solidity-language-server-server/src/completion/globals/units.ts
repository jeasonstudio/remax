import { CompletionItem, CompletionItemKind } from 'vscode-languageserver/browser';

// keywords
export const keywords: Record<string, string[]> = {
  wei: [],
  gwei: [],
  ether: [],
  seconds: [],
  minutes: [],
  hours: [],
  days: [],
  weeks: [],
};
// mapping(keyword => completion)
export const completions: Record<string, CompletionItem> = Object.fromEntries(
  Object.keys(keywords).map((keyword) => [
    keyword,
    {
      label: keyword,
      kind: CompletionItemKind.Keyword,
      detail: 'unit',
      documentation:
        'https://docs.soliditylang.org/en/latest/units-and-global-variables.html#units-and-globally-available-variables',
    },
  ]),
);
