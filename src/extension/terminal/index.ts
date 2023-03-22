import * as vscode from 'vscode';
import { RemaxTerminalProfileProvider } from './provider';

export async function activate(context: vscode.ExtensionContext) {
  const terminalProfileProvider = new RemaxTerminalProfileProvider();
  context.subscriptions.push(
    vscode.window.registerTerminalProfileProvider('remax.terminal-profile', terminalProfileProvider),
  );
}

export async function deactivate() {}
