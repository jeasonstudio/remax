// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { LanguageClient } from 'vscode-languageclient/browser';
import { createLanguageClient } from './client';
import { formatDocument } from './formatter';

let client: LanguageClient | null = null;

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log('Congratulations, your extension "remax-solidity-web" is now active in the web extension host!');

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  let disposable = vscode.commands.registerCommand('remax-solidity-web.helloWorld', () => {
    // The code you place here will be executed every time your command is executed

    // Display a message box to the user
    vscode.window.showInformationMessage('Hello World from solidity-web in a web extension host!');
  });

  context.subscriptions.push(disposable);

  context.subscriptions.push(
    vscode.languages.registerDocumentFormattingEditProvider('solidity', {
      async provideDocumentFormattingEdits(document: vscode.TextDocument): Promise<vscode.TextEdit[]> {
        return formatDocument(document, context);
      },
    }),
  );

  if (!client) {
    client = createLanguageClient(context);
  }
  client.start();
}

// This method is called when your extension is deactivated
export function deactivate() {
  if (client) {
    client.stop();
  }
}
