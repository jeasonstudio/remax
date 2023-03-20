import * as vscode from 'vscode';
import { format } from './prettier';

export async function activate(context: vscode.ExtensionContext) {
  // Add solidity file formatter
  context.subscriptions.push(
    vscode.languages.registerDocumentFormattingEditProvider('solidity', {
      async provideDocumentFormattingEdits(document: vscode.TextDocument): Promise<vscode.TextEdit[]> {
        return format(document, context);
      },
    }),
  );
}

export async function deactivate() {}
