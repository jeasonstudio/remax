import * as vscode from 'vscode';
import type { LanguageClientOptions } from 'vscode-languageclient';
import { LanguageClient, RevealOutputChannelOn } from 'vscode-languageclient/browser';

// This method is called when your extension is activated
export function createLanguageClient(context: vscode.ExtensionContext) {
  // Options to control the language client.
  const clientOptions: LanguageClientOptions = {
    // Register the server for solidity text documents.
    documentSelector: [{ scheme: 'file', language: 'solidity', pattern: `**/*.sol` }],
    synchronize: {
      fileEvents: [vscode.workspace.createFileSystemWatcher('**/*.sol')],
    },
    diagnosticCollectionName: 'solidity-language-server',
    initializationOptions: {
      extensionName: 'solidity-language-server',
      extensionVersion: '1.0.0',
    },
  };

  const serverMain = vscode.Uri.joinPath(context.extensionUri, 'dist/server/index.js');
  const worker = new Worker(serverMain.toString(true));
  const client = new LanguageClient('solidity', 'Solidity Language Server', clientOptions, worker);

  return client;
}
