import * as vscode from 'vscode';
import { format } from './prettier';

export async function activate(context: vscode.ExtensionContext) {
  // 注册格式化方法
  context.subscriptions.push(
    vscode.languages.registerDocumentFormattingEditProvider('solidity', {
      async provideDocumentFormattingEdits(
        document: vscode.TextDocument,
      ): Promise<vscode.TextEdit[]> {
        return format(document, context);
      },
    }),
  );
}

export async function deactivate() {}
