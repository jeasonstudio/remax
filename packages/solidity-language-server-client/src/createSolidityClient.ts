import * as vscode from 'vscode';
import type { LanguageClientOptions } from 'vscode-languageclient';
import { LanguageClient } from 'vscode-languageclient/browser';

// This method is called when your extension is activated
export function createSolidityClient(context: vscode.ExtensionContext) {
  // Options to control the language client.
  const clientOptions: LanguageClientOptions = {
    // Register the server for solidity text documents.
    documentSelector: [{ /*scheme: 'file',*/ language: 'solidity', pattern: `**/*.sol` }],
    synchronize: {
      fileEvents: [vscode.workspace.createFileSystemWatcher('**/*.sol')],
    },
    diagnosticCollectionName: 'solidity',
    initializationOptions: {
      extensionName: 'solidity-language-server',
      extensionVersion: '1.0.0',
      env: 'development',
    },
  };

  const serverMain = vscode.Uri.joinPath(context.extensionUri, 'dist/server.js');
  console.log('serverMain', serverMain.toString(true));
  const worker = new Worker(serverMain.toString(true));
  const client = new LanguageClient('solidity', 'Solidity Language Server', clientOptions, worker);

  return client;
}
