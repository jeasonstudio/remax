import { CompletionItemKind } from 'vscode-languageserver/browser';
import { ASTNodeFilter } from '../utils/parser';

export interface GloballyVariable {
  label: string;
  kind: CompletionItemKind;
  detail: string;
  documentation: string;
  filter?: ASTNodeFilter; // undefined/false means cannot filtered
  url?: string; // document url or something
}

export type GloballyVariables = GloballyVariable[];

export type GloballyVariableMap = Record<string, GloballyVariable>;

export { CompletionItemKind };
