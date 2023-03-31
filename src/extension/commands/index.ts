import * as vscode from 'vscode';
import * as workspace from './workspace';

let statusItem: vscode.StatusBarItem | null = null;

export async function activate(context: vscode.ExtensionContext) {
  await workspace.activate(context);

  // TODO: status bar
  statusItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
}

export async function deactivate() {
  await workspace.deactivate();
}
