import * as vscode from 'vscode';
import { LanguageClient } from 'vscode-languageclient/browser';
import { createClient } from './createClient';

let client: LanguageClient | null = null;

export function activate(context: vscode.ExtensionContext) {
  if (!client) {
    client = createClient(context);
  }
  client.start();
}

export function deactivate() {
  if (client) {
    client.stop();
  }
}
