import { CompletionItem, CompletionItemKind } from 'vscode-languageserver/browser';

// mapping(keyword => keyword[])
export const keywords: Record<string, string[]> = {
  assert: [],
  require: [],
  revert: [],
  selfdestruct: [],
};
// mapping(keyword => completion)
export const completions: Record<string, CompletionItem> = {
  assert: {
    label: 'assert',
    kind: CompletionItemKind.Function,
    detail: 'assert(bool condition)',
  },
  require: {
    label: 'require',
    kind: CompletionItemKind.Function,
    detail: 'require(bool condition, string memory message)',
  },
  revert: {
    label: 'revert',
    kind: CompletionItemKind.Function,
    detail: 'revert(string memory reason)',
  },
  selfdestruct: {
    label: 'selfdestruct',
    kind: CompletionItemKind.Function,
    detail: 'selfdestruct(address payable recipient)',
  },
};
