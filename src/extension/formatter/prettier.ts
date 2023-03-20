import * as vscode from 'vscode';
import type { Options } from 'prettier';
import * as prettier from 'prettier/standalone';

// Format Solidity Document
export function format(document: vscode.TextDocument, context: vscode.ExtensionContext): vscode.TextEdit[] {
  // TODO: Support ignore files

  const source = document.getText();
  const range = new vscode.Range(document.lineAt(0).range.start, document.lineAt(document.lineCount - 1).range.end);

  const prettierOptions: Options = {
    parser: 'solidity-parse',
    plugins: [require('prettier-plugin-solidity')],
    bracketSpacing: false,
    tabWidth: 4,
  };
  const formatted = prettier.format(source, prettierOptions);

  return [vscode.TextEdit.replace(range, formatted)];
}
