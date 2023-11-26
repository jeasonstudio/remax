import * as vscode from 'vscode';
import type { Options } from 'prettier';
import * as prettier from 'prettier/standalone';

// Format Solidity Document
export async function format(
  document: vscode.TextDocument,
  _context: vscode.ExtensionContext,
): Promise<vscode.TextEdit[]> {
  const config = vscode.workspace.getConfiguration('solidity-formatter') as Partial<Options>;

  const source = document.getText();
  const range = new vscode.Range(
    document.lineAt(0).range.start,
    document.lineAt(document.lineCount - 1).range.end,
  );

  const prettierOptions: Options = {
    parser: 'solidity-parse',
    plugins: [require('prettier-plugin-solidity')],
    singleQuote: config.singleQuote ?? false,
    bracketSpacing: config.bracketSpacing ?? false,
    tabWidth: config.tabWidth ?? 4,
    printWidth: config.printWidth ?? 80,
    useTabs: config.useTabs ?? false,
  };
  const formatted = prettier.format(source, prettierOptions);

  return [vscode.TextEdit.replace(range, formatted)];
}
