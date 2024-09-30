import * as vscode from 'vscode';
import * as client from './client';
import * as formatter from './formatter';
import * as fileSystem from './file-system';
import * as terminal from './terminal';
import * as welcome from './welcome';

export async function activate(context: vscode.ExtensionContext) {
  try {
    await client.activate(context);
    await formatter.activate(context);
    await fileSystem.activate(context);
    await terminal.activate(context);
    await welcome.activate(context);
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
  await terminal.deactivate();
  await welcome.deactivate();
}
