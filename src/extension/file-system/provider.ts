import * as vscode from 'vscode';
import path from 'path-browserify';
import { FileEntry, DirectoryEntry } from './entry';
import { FILE_SYSTEM_SCHEME } from '../../constants';
import { WrapperedIndexedDB } from './indexed-db';

// A good sample of indexeddb-fs
// https://github.dev/playerony/indexeddb-fs/blob/main/lib/database/index.ts

export class RemaxFileSystemProvider implements vscode.FileSystemProvider {
  // FileSystem Scheme
  public static scheme = FILE_SYSTEM_SCHEME;

  public static async create() {
    const rootUri = vscode.Uri.from({ scheme: RemaxFileSystemProvider.scheme, path: '/' });
    const widb = new WrapperedIndexedDB();
    const tx = await widb.transaction('readwrite');
    const rootEntry = await tx.get(rootUri, true);
    if (!rootEntry) {
      const rootDirectory = new DirectoryEntry('<root>');
      await tx.put(rootUri, rootDirectory);
    }
    return new RemaxFileSystemProvider(widb);
  }

  protected constructor(private readonly widb: WrapperedIndexedDB) {}

  /**
   * Get parent directory uri
   * @param uri {vscode.Uri} uri
   */
  private _getParentUri(uri: vscode.Uri): vscode.Uri {
    const parentUri = uri.with({ path: path.dirname(uri.path) });
    return parentUri;
  }

  /**
   * Get file stat
   * @param uri {vscode.Uri} uri
   * @returns entry stat
   */
  public async stat(uri: vscode.Uri): Promise<vscode.FileStat> {
    const tx = await this.widb.transaction('readonly');
    return tx.get(uri, false);
  }

  /**
   * Read directory
   * @param uri {vscode.Uri} uri
   * @returns directory entries
   */
  public async readDirectory(uri: vscode.Uri): Promise<[string, vscode.FileType][]> {
    const tx = await this.widb.transaction('readonly');
    const directory = await tx.get<DirectoryEntry>(uri, false);
    const result: [string, vscode.FileType][] = [];
    for (const [name, child] of directory.entries) {
      const childEntry = await tx.get(uri.with({ path: child }), false);
      result.push([name, childEntry.type]);
    }
    return result;
  }

  /**
   * Create directory
   * @param uri {vscode.Uri} uri do not ends with '/'
   */
  public async createDirectory(uri: vscode.Uri): Promise<void> {
    const tx = await this.widb.transaction('readwrite');
    const basename = path.basename(uri.path);
    const parentDirname = this._getParentUri(uri);
    const parent = await tx.get<DirectoryEntry>(parentDirname, false);
    const entry = new DirectoryEntry(basename);
    parent.entries.set(entry.name, uri.path);
    parent.mtime = Date.now();
    parent.size += 1;
    await tx.put(parentDirname, parent);
    await tx.put(uri, entry);
    this._emitter.fire([
      { type: vscode.FileChangeType.Changed, uri: parentDirname },
      { type: vscode.FileChangeType.Created, uri },
    ]);
  }

  /**
   * Read file
   * @param uri {vscode.Uri} uri
   * @returns {Promise<Uint8Array>}
   */
  public async readFile(uri: vscode.Uri): Promise<Uint8Array> {
    const tx = await this.widb.transaction('readonly');
    const file = await tx.get<FileEntry>(uri, false);
    if (!file.data) {
      throw vscode.FileSystemError.FileNotFound(uri);
    }
    return file.data;
  }

  public async writeFile(
    uri: vscode.Uri,
    content: Uint8Array,
    options: { create: boolean; overwrite: boolean },
  ): Promise<void> {
    const tx = await this.widb.transaction('readwrite');
    const basename = path.basename(uri.path);
    const parentDirname = this._getParentUri(uri);
    const parent = await tx.get<DirectoryEntry>(parentDirname, false);

    const entryPath = parent.entries.get(basename);
    let entry = entryPath ? await tx.get<FileEntry>(uri.with({ path: entryPath }), true) : undefined;
    if (entry?.type === vscode.FileType.Directory) {
      throw vscode.FileSystemError.FileIsADirectory(uri);
    }
    if (!entry && !options.create) {
      throw vscode.FileSystemError.FileNotFound(uri);
    }
    if (entry && options.create && !options.overwrite) {
      throw vscode.FileSystemError.FileExists(uri);
    }
    if (!entry) {
      entry = new FileEntry(basename);
      parent.entries.set(basename, uri.path);
      await tx.put(parentDirname, parent);
      this._emitter.fire([{ type: vscode.FileChangeType.Created, uri }]);
    }
    entry.mtime = Date.now();
    entry.size = content.byteLength;
    entry.data = content;

    await tx.put(uri, entry);
    this._emitter.fire([{ type: vscode.FileChangeType.Changed, uri }]);
  }

  /**
   * Delete file or directory
   * @param uri {vscode.Uri}
   * @param options
   */
  public async delete(uri: vscode.Uri, options: { recursive: boolean }): Promise<void> {
    const tx = await this.widb.transaction('readwrite');
    const dirname = this._getParentUri(uri);
    const parent = await tx.get<DirectoryEntry>(dirname, false);

    const basename = path.basename(uri.path);
    if (!parent.entries.has(basename)) {
      throw vscode.FileSystemError.FileNotFound(uri);
    }
    parent.entries.delete(basename);
    parent.mtime = Date.now();
    parent.size -= 1;

    // TODO: what if recursive=true?
    await tx.delete(uri);
    await tx.put(dirname, parent);

    this._emitter.fire([
      { type: vscode.FileChangeType.Changed, uri: dirname },
      { uri, type: vscode.FileChangeType.Deleted },
    ]);
  }

  /**
   * Rename file or directory
   * @param oldUri {vscode.Uri}
   * @param newUri {vscode.Uri}
   * @param options
   */
  public async rename(oldUri: vscode.Uri, newUri: vscode.Uri, options: { overwrite: boolean }): Promise<void> {
    const tx = await this.widb.transaction('readwrite');
    const targetFile = await tx.get<FileEntry>(newUri, true);
    if (!options.overwrite && targetFile) {
      throw vscode.FileSystemError.FileExists(newUri);
    }

    const entry = await tx.get(oldUri, false);
    const oldName = entry.name;
    const newName = path.basename(newUri.path);
    entry.name = newName;
    await tx.put(newUri, entry);

    // rm from old dir
    const oldParentDirname = this._getParentUri(oldUri);
    const oldParent = await tx.get<DirectoryEntry>(oldParentDirname, false);
    oldParent.entries.delete(oldName);
    await tx.put(oldParentDirname, oldParent);
    await tx.delete(oldUri);

    // add to new dir
    const newParentDirname = this._getParentUri(newUri);
    const newParent = await tx.get<DirectoryEntry>(newParentDirname, false);
    newParent.entries.set(newName, newUri.path);
    await tx.put(newParentDirname, newParent);

    this._emitter.fire([
      { type: vscode.FileChangeType.Deleted, uri: oldUri },
      { type: vscode.FileChangeType.Created, uri: newUri },
    ]);
  }

  // copy do not need to implement

  // --- manage file events

  private _emitter = new vscode.EventEmitter<vscode.FileChangeEvent[]>();
  public readonly onDidChangeFile: vscode.Event<vscode.FileChangeEvent[]> = this._emitter.event;

  public watch(_resource: vscode.Uri): vscode.Disposable {
    // ignore, fires for all changes...
    return new vscode.Disposable(() => {});
  }
}
