import * as vscode from 'vscode';
import * as client from './client';
import * as formatter from './formatter';
import * as fileSystem from './file-system';

export async function activate(context: vscode.ExtensionContext) {
  try {
    // Active language server client
    await client.activate(context);
    // Active solidity formatter
    await formatter.activate(context);
    // Active file-system provider
    await fileSystem.activate(context);
  } catch (error) {
    console.error(error);
  }
  context.subscriptions.push(
    vscode.commands.registerCommand('remax.hello-world', () => {
      vscode.window.showInformationMessage('Hello World web extension host!');
      console.log('Hello World web extension host!');
    }),
  );
}

export async function deactivate() {
  await client.deactivate();
  await formatter.deactivate();
  await fileSystem.deactivate();
}
