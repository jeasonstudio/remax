import { CompletionItem } from 'vscode-languageserver/browser';
import { keywords as mathKeywords, completions as mathCompletions } from './math';
import { keywords as modifiersKeywords, completions as modifiersCompletions } from './modifiers';
import { keywords as reservedKeywords, completions as reservedCompletions } from './reserved';
import { keywords as specifiersKeywords, completions as specifiersCompletions } from './specifiers';
import { keywords as statementsKeywords, completions as statementsCompletions } from './statements';
import { keywords as typesKeywords, completions as typesCompletions } from './types';
import { keywords as unitsKeywords, completions as unitsCompletions } from './units';
import { keywords as variablesKeywords, completions as variablesCompletions } from './variables';

export const keywords = {
  ...mathKeywords,
  ...modifiersKeywords,
  ...reservedKeywords,
  ...specifiersKeywords,
  ...statementsKeywords,
  ...typesKeywords,
  ...unitsKeywords,
  ...variablesKeywords,
};

export const completions: Record<string, CompletionItem> = {
  ...mathCompletions,
  ...modifiersCompletions,
  ...reservedCompletions,
  ...specifiersCompletions,
  ...statementsCompletions,
  ...typesCompletions,
  ...unitsCompletions,
  ...variablesCompletions,
};

export const globalVariables: string[] = ['abi', 'bytes', 'block', 'msg', 'tx'];

export const getGlobalCompletionsByKeyword = (keyword?: string) => {
  if (keyword === undefined) {
    const globalCompletions = globalVariables.map((globalVariable) => completions[globalVariable]);
    return globalCompletions;
  }
  const subKeywords = keywords[keyword];
  if (subKeywords?.length) {
    const result = subKeywords.map((subKeyword) => completions[subKeyword]);
    return result;
  }
  return [];
};
