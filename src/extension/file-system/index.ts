import * as vscode from 'vscode';
import { RemaxFileSystemProvider } from './provider';

export async function activate(context: vscode.ExtensionContext) {
  const remaxFileSystemProvider = await RemaxFileSystemProvider.create();

  // Register remax file system provider
  context.subscriptions.push(
    vscode.workspace.registerFileSystemProvider(RemaxFileSystemProvider.scheme, remaxFileSystemProvider, {
      isCaseSensitive: true,
      isReadonly: false,
    }),
  );
}

export async function deactivate() {}
