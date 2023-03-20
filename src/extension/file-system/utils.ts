import * as vscode from 'vscode';

export class File implements vscode.FileStat {
  public readonly type = vscode.FileType.File;
  public readonly ctime = Date.now();
  public mtime = Date.now();
  public size: number = 0;

  public name: string;
  public data?: Uint8Array;

  public constructor(name: string, data?: Uint8Array) {
    this.name = name;
    if (data) {
      this.data = data;
      this.size = data.byteLength;
    }
  }
}

export class Directory implements vscode.FileStat {
  public readonly type = vscode.FileType.Directory;
  public readonly ctime = Date.now();
  public mtime = Date.now();
  public size: number = 0;

  public name: string;
  public entries: Map<string, File | Directory> = new Map();

  public constructor(name: string) {
    this.name = name;
  }
}
