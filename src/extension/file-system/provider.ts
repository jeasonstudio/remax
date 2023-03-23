import * as vscode from 'vscode';
import path from 'path-browserify';
import { FILE_SYSTEM_SCHEME } from '../../constants';
import { RemaxFileSystem, NodeDirent, NodeStats } from '../../file-system';
import { Buffer } from 'buffer/';

export class RemaxFileSystemProvider implements vscode.FileSystemProvider {
  // FileSystem Scheme
  public static scheme = FILE_SYSTEM_SCHEME;

  public static async create() {
    const remaxfs = await RemaxFileSystem.init();
    return new RemaxFileSystemProvider(remaxfs);
  }

  protected constructor(private readonly remaxfs: RemaxFileSystem) {}

  private _emitter = new vscode.EventEmitter<vscode.FileChangeEvent[]>();
  public readonly onDidChangeFile: vscode.Event<vscode.FileChangeEvent[]> = this._emitter.event;

  public watch(_resource: vscode.Uri): vscode.Disposable {
    // ignore, fires for all changes...
    return new vscode.Disposable(() => {});
  }

  private uriToFsPath(uri: vscode.Uri): string {
    return uri.path;
  }
  private fsPathToUri(p: string): vscode.Uri {
    return vscode.Uri.from({ scheme: FILE_SYSTEM_SCHEME, path: p });
  }

  /**
   * Convert BrowserFS type to vscode.FileType
   * @param stat remaxfs(browserfs).Stats
   * @returns vscode.FileType
   */
  private convertType(stat: NodeStats | NodeDirent): vscode.FileType {
    try {
      let type: vscode.FileType = vscode.FileType.Unknown;
      if (stat.isFile()) {
        type = vscode.FileType.File;
      } else if (stat.isDirectory()) {
        type = vscode.FileType.Directory;
      } else if (stat.isSymbolicLink()) {
        type = vscode.FileType.SymbolicLink;
      } else {
        type = vscode.FileType.Unknown;
      }
      return type;
    } catch (error) {
      return vscode.FileType.Unknown;
    }
  }

  /**
   * Retrieve metadata about a file.
   *
   * Note that the metadata for symbolic links should be the metadata of the file they refer to.
   * Still, the [SymbolicLink](#FileType.SymbolicLink)-type must be used in addition to the actual type, e.g.
   * `FileType.SymbolicLink | FileType.Directory`.
   *
   * @param uri The uri of the file to retrieve metadata about.
   * @return The file metadata about the file.
   * @throws [`FileNotFound`](#FileSystemError.FileNotFound) when `uri` doesn't exist.
   */
  public async stat(uri: vscode.Uri): Promise<vscode.FileStat> {
    const p = this.uriToFsPath(uri);
    try {
      const stats = await this.remaxfs.stat(p);
      const type = this.convertType(stats);
      const fileStats: vscode.FileStat = {
        type,
        ctime: stats.ctime.valueOf(),
        mtime: stats.mtime.valueOf(),
        size: stats.size,
      };
      return fileStats;
    } catch (error) {
      throw vscode.FileSystemError.FileNotFound(uri);
    }
  }

  /**
   * Retrieve all entries of a {@link FileType.Directory directory}.
   *
   * @param uri The uri of the folder.
   * @return An array of name/type-tuples or a thenable that resolves to such.
   * @throws {@linkcode FileSystemError.FileNotFound FileNotFound} when `uri` doesn't exist.
   */
  public async readDirectory(uri: vscode.Uri): Promise<[string, vscode.FileType][]> {
    const p = this.uriToFsPath(uri);
    try {
      const items = await this.remaxfs.readdir(p, { withFileTypes: true });
      const names: [string, vscode.FileType][] = items.map((item) => [item.name, this.convertType(item)]);
      return names;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Create a new directory (Note, that new files are created via `write`-calls).
   *
   * @param uri The uri of the new folder.
   * @throws {@linkcode FileSystemError.FileNotFound FileNotFound} when the parent of `uri` doesn't exist, e.g. no mkdirp-logic required.
   * @throws {@linkcode FileSystemError.FileExists FileExists} when `uri` already exists.
   * @throws {@linkcode FileSystemError.NoPermissions NoPermissions} when permissions aren't sufficient.
   */
  public async createDirectory(uri: vscode.Uri): Promise<void> {
    const p = this.uriToFsPath(uri);
    const parentPath = path.dirname(p);
    const parentExists = await this.remaxfs.exists(parentPath);
    if (!parentExists) {
      throw vscode.FileSystemError.FileNotFound(this.fsPathToUri(parentPath));
    }
    const exists = await this.remaxfs.exists(p);
    if (exists) {
      throw vscode.FileSystemError.FileExists(uri);
    }
    try {
      await this.remaxfs.mkdir(p);
      this._emitter.fire([{ type: vscode.FileChangeType.Created, uri }]);
    } catch (error) {
      throw vscode.FileSystemError.NoPermissions(uri);
    }
  }

  /**
   * Read the entire contents of a file.
   *
   * @param uri The uri of the file.
   * @return An array of bytes or a thenable that resolves to such.
   * @throws {@linkcode FileSystemError.FileNotFound FileNotFound} when `uri` doesn't exist.
   */
  public async readFile(uri: vscode.Uri): Promise<Uint8Array> {
    const p = this.uriToFsPath(uri);
    const exists = await this.remaxfs.exists(p);
    if (!exists) {
      throw vscode.FileSystemError.FileNotFound(uri);
    }
    try {
      const content = await this.remaxfs.readFile(p);
      return content;
    } catch (error) {
      throw vscode.FileSystemError.NoPermissions(uri);
    }
  }

  /**
   * Write data to a file, replacing its entire contents.
   *
   * @param uri The uri of the file.
   * @param content The new content of the file.
   * @param options Defines if missing files should or must be created.
   * @throws {@linkcode FileSystemError.FileNotFound FileNotFound} when `uri` doesn't exist and `create` is not set.
   * @throws {@linkcode FileSystemError.FileNotFound FileNotFound} when the parent of `uri` doesn't exist and `create` is set, e.g. no mkdirp-logic required.
   * @throws {@linkcode FileSystemError.FileExists FileExists} when `uri` already exists, `create` is set but `overwrite` is not set.
   * @throws {@linkcode FileSystemError.NoPermissions NoPermissions} when permissions aren't sufficient.
   */
  public async writeFile(
    uri: vscode.Uri,
    content: Uint8Array,
    options: { create: boolean; overwrite: boolean },
  ): Promise<void> {
    const p = this.uriToFsPath(uri);
    const exists = await this.remaxfs.exists(p);

    if (!exists && !options.create) {
      throw vscode.FileSystemError.FileNotFound(uri);
    }

    const parentPath = path.dirname(p);
    const parentExists = await this.remaxfs.exists(parentPath);

    if (!parentExists && options.create) {
      throw vscode.FileSystemError.FileNotFound(this.fsPathToUri(parentPath));
    }

    if (exists && options.create && !options.overwrite) {
      throw vscode.FileSystemError.FileExists(uri);
    }

    if (exists) {
      const fileStat = await this.stat(uri);
      if (fileStat.type !== vscode.FileType.File) {
        throw vscode.FileSystemError.FileNotFound(uri);
      }
    }

    try {
      await this.remaxfs.writeFile(p, Buffer.from(content));
      this._emitter.fire([{ type: exists ? vscode.FileChangeType.Changed : vscode.FileChangeType.Created, uri }]);
    } catch (error) {
      throw vscode.FileSystemError.NoPermissions(uri);
    }
  }

  /**
   * Delete a file.
   *
   * @param uri The resource that is to be deleted.
   * @param options Defines if deletion of folders is recursive.
   * @throws [`FileNotFound`](#FileSystemError.FileNotFound) when `uri` doesn't exist.
   * @throws [`NoPermissions`](#FileSystemError.NoPermissions) when permissions aren't sufficient.
   */
  public async delete(uri: vscode.Uri, options: { recursive: boolean }): Promise<void> {
    const p = this.uriToFsPath(uri);
    const exists = await this.remaxfs.exists(p);
    if (!exists) {
      throw vscode.FileSystemError.FileNotFound(uri);
    }
    try {
      await this.remaxfs.rm(p, { force: false, recursive: options.recursive });
      this._emitter.fire([{ type: vscode.FileChangeType.Deleted, uri }]);
    } catch (error) {
      throw vscode.FileSystemError.NoPermissions(uri);
    }
  }

  /**
   * Rename a file or folder.
   *
   * @param oldUri The existing file.
   * @param newUri The new location.
   * @param options Defines if existing files should be overwritten.
   * @throws [`FileNotFound`](#FileSystemError.FileNotFound) when `oldUri` doesn't exist.
   * @throws [`FileNotFound`](#FileSystemError.FileNotFound) when parent of `newUri` doesn't exist, e.g. no mkdirp-logic required.
   * @throws [`FileExists`](#FileSystemError.FileExists) when `newUri` exists and when the `overwrite` option is not `true`.
   * @throws [`NoPermissions`](#FileSystemError.NoPermissions) when permissions aren't sufficient.
   */
  public async rename(oldUri: vscode.Uri, newUri: vscode.Uri, options: { overwrite: boolean }): Promise<void> {
    const oldP = this.uriToFsPath(oldUri);
    const newP = this.uriToFsPath(newUri);
    const newParent = path.dirname(newP);
    const exists = await this.remaxfs.exists(oldP);
    if (!exists) {
      throw vscode.FileSystemError.FileNotFound(oldUri);
    }
    const newParentExists = await this.remaxfs.exists(newParent);
    if (!newParentExists) {
      throw vscode.FileSystemError.FileNotFound(newUri.with({ path: newParent }));
    }
    const newExists = await this.remaxfs.exists(newP);
    if (newExists && !options.overwrite) {
      throw vscode.FileSystemError.FileExists(newUri);
    }

    try {
      await this.remaxfs.rename(oldP, newP);
      this._emitter.fire([
        { type: vscode.FileChangeType.Deleted, uri: oldUri },
        { type: vscode.FileChangeType.Created, uri: newUri },
      ]);
    } catch (error) {
      throw vscode.FileSystemError.NoPermissions(oldUri);
    }
  }
}
