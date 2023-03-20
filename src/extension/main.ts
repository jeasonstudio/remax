import * as vscode from 'vscode';
import * as client from './client';
import * as formatter from './formatter';
import * as fileSystem from './file-system';

export function activate(context: vscode.ExtensionContext) {
  // Active language server client
  client.activate(context);
  // Active solidity formatter
  formatter.activate(context);
  // Active file-system provider
  fileSystem.activate(context);

  context.subscriptions.push(
    vscode.commands.registerCommand('remax.hello-world', () => {
      vscode.window.showInformationMessage('Hello World web extension host!');
      console.log('Hello World web extension host!');
    }),
  );
}

export function deactivate() {
  client.deactivate();
  formatter.deactivate();
  fileSystem.deactivate();
}
