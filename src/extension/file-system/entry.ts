import * as vscode from 'vscode';

export class FileEntry implements vscode.FileStat {
  public type = vscode.FileType.File;
  public ctime = Date.now();
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

export class DirectoryEntry implements vscode.FileStat {
  public type = vscode.FileType.Directory;
  public ctime = Date.now();
  public mtime = Date.now();
  public size: number = 0;

  public name: string;
  // mappings from entry name to entry path
  public entries: Map<string, string> = new Map();

  public constructor(name: string) {
    this.name = name;
  }
}

export type Entry = FileEntry | DirectoryEntry;
