import { CompletionItem, CompletionItemKind } from 'vscode-languageserver/browser';

const types = [
  'after',
  'alias',
  'apply',
  'auto',
  'case',
  'copyof',
  'default',
  'define',
  'final',
  'immutable',
  'implements',
  'in',
  'inline',
  'let',
  'macro',
  'match',
  'mutable',
  'null',
  'of',
  'partial',
  'promise',
  'return',
  'reference',
  'relocatable',
  'sealed',
  'sizeof',
  'static',
  'supports',
  'switch',
  'typedef',
  'typeof',
  'unchecked',
];

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
      tags: [1], // not use
    },
  ]),
);
