import { configureSingle } from "@zenfs/core";
import path from "path-browserify";
import * as vscode from "vscode";
import { IndexedDB } from "@zenfs/dom";
import * as fs from "@zenfs/core/promises";

export class FileSystemProvider implements vscode.FileSystemProvider {
  private _emitter = new vscode.EventEmitter<vscode.FileChangeEvent[]>();
  private _bufferedEvents: vscode.FileChangeEvent[] = [];
  private _fireSoonHandle?: NodeJS.Timeout;

  readonly onDidChangeFile: vscode.Event<vscode.FileChangeEvent[]> =
    this._emitter.event;

  constructor(
    private readonly _configure: Promise<void> = configureSingle({
      backend: IndexedDB,
    }),
  ) {}

  private async _lookup(p: string, silent: false): Promise<vscode.FileStat>;
  private async _lookup(p: string, silent: boolean): Promise<vscode.FileStat>;
  private async _lookup(
    p: string,
    silent: boolean,
  ): Promise<vscode.FileStat | null> {
    await this._configure;
    const exists = await fs.exists(p);
    if (!exists) {
      if (!silent)
        throw vscode.FileSystemError.FileNotFound(vscode.Uri.file(p));
      return null;
    }
    const stat = await fs.stat(p);
    let type: vscode.FileType = vscode.FileType.Unknown;
    if (stat.isFile()) {
      type = vscode.FileType.File;
    } else if (stat.isDirectory()) {
      type = vscode.FileType.Directory;
    } else if (stat.isSymbolicLink()) {
      type = vscode.FileType.SymbolicLink;
    }
    return {
      type,
      ctime: stat.ctimeMs,
      mtime: stat.mtimeMs,
      size: stat.size,
    };
  }

  private _fireSoon(...events: vscode.FileChangeEvent[]): void {
    this._bufferedEvents.push(...events);
    if (this._fireSoonHandle) {
      clearTimeout(this._fireSoonHandle);
    }
    this._fireSoonHandle = setTimeout(() => {
      this._emitter.fire(this._bufferedEvents);
      this._bufferedEvents.length = 0;
    }, 5);
  }

  watch(
    uri: vscode.Uri,
    options: {
      readonly recursive: boolean;
      readonly excludes: readonly string[];
    },
  ): vscode.Disposable {
    // TODO@jeason: implement watch
    return new vscode.Disposable(() => {});
  }
  async stat(uri: vscode.Uri): Promise<vscode.FileStat> {
    await this._configure;
    return this._lookup(uri.path, false);
  }
  async readDirectory(uri: vscode.Uri): Promise<[string, vscode.FileType][]> {
    await this._configure;
    const dirInfo = await fs.readdir(uri.path, {
      withFileTypes: true,
      recursive: false,
    });
    return dirInfo.map((info) => {
      let type: vscode.FileType = vscode.FileType.Unknown;
      if (info.isFile()) {
        type = vscode.FileType.File;
      } else if (info.isDirectory()) {
        type = vscode.FileType.Directory;
      } else if (info.isSymbolicLink()) {
        type = vscode.FileType.SymbolicLink;
      }
      return [info.path, type];
    });
  }
  async createDirectory(uri: vscode.Uri): Promise<void> {
    await this._configure;
    await fs.mkdir(uri.path, { recursive: true });
    this._fireSoon(
      {
        type: vscode.FileChangeType.Changed,
        uri: uri.with({ path: path.posix.dirname(uri.path) }),
      },
      { type: vscode.FileChangeType.Created, uri },
    );
  }
  async readFile(uri: vscode.Uri): Promise<Uint8Array> {
    await this._configure;
    await this._lookup(uri.path, false);
    const content = await fs.readFile(uri.path);
    return new Uint8Array(content.buffer);
  }
  async writeFile(
    uri: vscode.Uri,
    content: Uint8Array,
    options: { readonly create: boolean; readonly overwrite: boolean },
  ): Promise<void> {
    await this._configure;
    const entry = await this._lookup(uri.path, true);
    if (!entry && !options.create) {
      throw vscode.FileSystemError.FileNotFound(uri);
    } else if (entry && options.create && !options.overwrite) {
      throw vscode.FileSystemError.FileExists(uri);
    }
    await fs.writeFile(uri.path, content, { mode: "0644", flag: "w" });
    if (!entry) this._fireSoon({ type: vscode.FileChangeType.Created, uri });
    this._fireSoon({ type: vscode.FileChangeType.Created, uri });
  }
  async delete(
    uri: vscode.Uri,
    options: { readonly recursive: boolean },
  ): Promise<void> {
    await this._configure;
    await fs.rm(uri.path, { recursive: options.recursive });
    this._fireSoon(
      {
        type: vscode.FileChangeType.Changed,
        uri: uri.with({ path: path.posix.dirname(uri.path) }),
      },
      { uri, type: vscode.FileChangeType.Deleted },
    );
  }
  async rename(
    oldUri: vscode.Uri,
    newUri: vscode.Uri,
    options: { readonly overwrite: boolean },
  ): Promise<void> {
    await this._configure;
    await fs.rename(oldUri.path, newUri.path);
    this._fireSoon(
      { type: vscode.FileChangeType.Deleted, uri: oldUri },
      { type: vscode.FileChangeType.Created, uri: newUri },
    );
  }
}
