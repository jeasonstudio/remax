import * as vscode from 'vscode';
import { findSolidityFiles, readFileContent } from './fs';
import { LanguageClient, State } from 'vscode-languageclient/browser';
import { TextDocumentItem } from 'vscode-languageserver-protocol';

export class SolidityFileWatcher {
  private _watcher: vscode.FileSystemWatcher;
  private _documents: Record<string, TextDocumentItem> = {};

  public constructor() {
    this._watcher = vscode.workspace.createFileSystemWatcher('**/*.sol');
  }
  public get fileEvent() {
    return this._watcher;
  }
  public get documents() {
    return this._documents;
  }

  private async getTextDocument(uri: vscode.Uri): Promise<TextDocumentItem> {
    const text = await readFileContent(uri);
    return {
      languageId: 'solidity',
      text,
      uri: uri.toString(true),
      version: 1,
    };
  }

  public listen(client: LanguageClient) {
    client.onDidChangeState(async ({ newState }) => {
      if (newState === State.Running) {
        const files = await findSolidityFiles(vscode.workspace.workspaceFolders![0].uri);
        for (let index = 0; index < files.length; index += 1) {
          const fileUri = files[index];
          const td = await this.getTextDocument(fileUri);
          this._documents[td.uri] = td;
        }
        client.sendNotification(
          'remax.text-documents.on-sync',
          Object.freeze({ documents: this._documents }),
        );
      }
    });

    this._watcher.onDidChange(async (uri) => {
      const td = await this.getTextDocument(uri);
      this._documents[td.uri] = td;
      if (client.state === State.Running) {
        client.sendNotification(
          'remax.text-documents.on-create',
          Object.freeze({ textDocument: td }),
        );
      }
    });
    this._watcher.onDidDelete(async (uri) => {
      delete this._documents[uri.toString(true)];
      if (client.state === State.Running) {
        client.sendNotification(
          'remax.text-documents.on-delete',
          Object.freeze({ textDocument: { uri: uri.toString(true) } }),
        );
      }
    });
  }
}
