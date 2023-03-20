import * as vscode from 'vscode';
import path from 'path-browserify';
import { Octokit } from '@octokit/core';

export class GistFileSystemProvider implements vscode.FileSystemProvider {
  private _emitter = new vscode.EventEmitter<vscode.FileChangeEvent[]>();
  private octokit = new Octokit({ auth: '' });
  private headers = { 'X-GitHub-Api-Version': '2022-11-28' };

  /**
   * Get GIST_ID from uri
   * @param uri vscode.Uri gist:/2d0aea0636d65c2c436202e4ff15xxxx/xxx
   * @returns GIST_ID
   */
  private getGistId(uri: vscode.Uri): string | null {
    if (uri.scheme !== 'gist' || !uri.path.startsWith('/')) {
      return null;
    }
    const gistId = uri.path.split('/')[1];
    if (!gistId || gistId.length !== 32) {
      return null;
    }
    return gistId;
  }

  // private getPath(uri: vscode.Uri): string | null {
  //   const gistId = this.getGistId(uri);
  //   if (!gistId) {
  //     return null;
  //   }
  //   const [, realPath] = uri.path.split(gistId);
  //   return realPath || null;
  // }

  public gistId = '2d0aea0636d65c2c436202e4ff1550e0';

  readonly onDidChangeFile: vscode.Event<vscode.FileChangeEvent[]> = this._emitter.event;

  watch(
    _uri: vscode.Uri,
    _options: { readonly recursive: boolean; readonly excludes: readonly string[] },
  ): vscode.Disposable {
    // ignore, fires for all changes...
    return new vscode.Disposable(() => {});
  }
  async stat(uri: vscode.Uri): Promise<vscode.FileStat> {
    // const res = await this.octokit.request('GET /gists/' + this.gistId, {
    //   gist_id: this.gistId,
    // });
    // console.log(111, res);
    const gistId = this.getGistId(uri);
    // const path = this.getPath(uri);
    console.log('stat', uri);
    throw new Error('Method stat not implemented.');
  }
  readDirectory(uri: vscode.Uri): [string, vscode.FileType][] | Thenable<[string, vscode.FileType][]> {
    console.log('readDirectory', uri);
    throw new Error('Method readDirectory not implemented.');
  }
  createDirectory(uri: vscode.Uri): void | Thenable<void> {
    console.log('createDirectory', uri);
    throw new Error('Method createDirectory not implemented.');
  }
  readFile(uri: vscode.Uri): Uint8Array | Thenable<Uint8Array> {
    console.log('readFile', uri);
    throw new Error('Method readFile not implemented.');
  }
  writeFile(
    uri: vscode.Uri,
    content: Uint8Array,
    options: { readonly create: boolean; readonly overwrite: boolean },
  ): void | Thenable<void> {
    console.log('writeFile', uri, content, options);
    throw new Error('Method writeFile not implemented.');
  }
  delete(uri: vscode.Uri, options: { readonly recursive: boolean }): void | Thenable<void> {
    console.log('delete', uri, options);
    throw new Error('Method delete not implemented.');
  }
  rename(oldUri: vscode.Uri, newUri: vscode.Uri, options: { readonly overwrite: boolean }): void | Thenable<void> {
    console.log('rename', oldUri, newUri, options);
    throw new Error('Method rename not implemented.');
  }
  copy(source: vscode.Uri, destination: vscode.Uri, options: { readonly overwrite: boolean }): void | Thenable<void> {
    console.log('copy', source, destination, options);
    throw new Error('Method `gist.copy` not implemented.');
  }
}
