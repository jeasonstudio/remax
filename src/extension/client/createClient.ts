import * as vscode from 'vscode';
import { LanguageClient, LanguageClientOptions, ProgressType } from 'vscode-languageclient/browser';

// This method is called when your extension is activated
export function createClient(context: vscode.ExtensionContext) {
  const fileEvent = vscode.workspace.createFileSystemWatcher('**/*.sol');

  // Options to control the language client.
  const clientOptions: LanguageClientOptions = {
    // Register the server for solidity text documents.
    documentSelector: [{ /*scheme: 'file',*/ language: 'solidity', pattern: `**/*.sol` }],
    synchronize: {
      fileEvents: [fileEvent],
    },
    diagnosticCollectionName: 'solidity',
    initializationOptions: {
      extensionName: 'solidity-language-server',
      extensionVersion: '1.0.0',
      env: 'development',
    },
  };

  const serverMain = vscode.Uri.joinPath(context.extensionUri, 'language-server.js');
  const worker = new Worker(serverMain.toString(true));
  const client = new LanguageClient('solidity', 'Solidity Language Server', clientOptions, worker);

  client.onNotification('remax/compile', (input: string) => {
    console.log('remax/compile', input);
  });

  return client;
}
