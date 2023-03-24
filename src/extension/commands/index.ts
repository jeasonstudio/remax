import * as vscode from 'vscode';
import * as workspace from './workspace';

export async function activate(context: vscode.ExtensionContext) {
  await workspace.activate(context);
}

export async function deactivate() {
  await workspace.deactivate();
}
