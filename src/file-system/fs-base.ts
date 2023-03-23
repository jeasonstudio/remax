import pify from 'pify';
import path from 'path-browserify';
import { ApiError } from 'browserfs/dist/node/core/api_error';
import { FileFlag } from 'browserfs/dist/node/core/file_flag';
import type * as nfs from 'node:fs';
import { FileSystem } from './types';
import { Buffer } from 'buffer/';

export class FileSystemBase {
  protected constructor(protected readonly fs: FileSystem) {}

  protected ApiError = ApiError;
  protected FileFlag = FileFlag;

  // #region base
  public async watch() {
    // TODO: implement
    throw new Error("Method 'fs.watch' not implemented.");
  }

  public async stat(p: string): Promise<nfs.Stats> {
    const stat = await pify(this.fs.stat.bind(this.fs))(p, false);
    return stat;
  }

  public async lstat(p: string): Promise<nfs.Stats> {
    const stat = await pify(this.fs.stat.bind(this.fs))(p, true);
    return stat;
  }

  public async rename(oldPath: string, newPath: string): Promise<void> {
    return pify(this.fs.rename.bind(this.fs))(oldPath, newPath);
  }

  public async rm(p: string, options?: { recursive?: boolean; force?: boolean }): Promise<void> {
    const force = options?.force ?? false;
    const recursive = options?.recursive ?? false;
    const exists = await this.exists(p);

    if (!exists && !force) {
      throw this.ApiError.ENOENT(p);
    } else if (!exists && force) {
      // DO NOTHING
    } else {
      const stats = await this.stat(p);
      if (stats.isDirectory()) {
        await this.rmdir(p, { recursive });
      } else {
        await pify(this.fs.unlink.bind(this.fs))(p);
      }
    }
  }

  /**
   * Not recommended to use this method. But good to use.
   */
  public async exists(p: string): Promise<boolean> {
    try {
      const stats = await this.stat(p);
      return !!stats;
    } catch (error) {
      return false;
    }
  }
  // #endregion

  /**
   * Traversal directory(Internal use)
   * @param fromDir directory to traversal
   * @param cb function to call on each file
   */
  // public async _traversal(fromDir: string, cb: (p: string, stats: nfs.Stats) => Promise<void>) {}

  // #region files
  public async appendFile(p: string, data: Buffer, options?: { mode?: number; flag?: string }): Promise<void> {
    const mode = options?.mode ?? 666;
    const flag = this.FileFlag.getFileFlag(options?.flag ?? 'a');
    const encoding = null;
    return pify(this.fs.appendFile.bind(this.fs))(p, data, encoding, flag, mode);
  }

  public async writeFile(p: string, data: Buffer, options?: { mode?: number; flag?: string }): Promise<void> {
    const mode = options?.mode ?? 666;
    const flag = this.FileFlag.getFileFlag(options?.flag ?? 'w');
    const encoding = null;
    return pify(this.fs.writeFile.bind(this.fs))(p, data, encoding, flag, mode);
  }

  public async readFile(p: string, options?: { flag?: string }): Promise<Buffer> {
    const flag = this.FileFlag.getFileFlag(options?.flag ?? 'r');
    const encoding = null;
    return pify(this.fs.readFile.bind(this.fs))(p, encoding, flag);
  }

  public async copyFile(src: string, dest: string): Promise<void> {
    const srcExists = await this.exists(src);
    if (!srcExists) {
      throw this.ApiError.ENOENT(src);
    }
    const content = await this.readFile(src);
    await this.writeFile(dest, content);
  }
  // #endregion

  // #region directories
  public async readdir(p: string): Promise<string[]>;
  public async readdir(p: string, options: { withFileTypes: false }): Promise<string[]>;
  public async readdir(p: string, options: { withFileTypes: true }): Promise<nfs.Dirent[]>;
  public async readdir(p: string, options?: { withFileTypes?: boolean }): Promise<any> {
    const withFileTypes = options?.withFileTypes ?? false;
    const names: string[] = await pify(this.fs.readdir.bind(this.fs))(p);
    if (withFileTypes) {
      return Promise.all(
        names.map(async (fname) => {
          const fpath = path.join(p, fname);
          const stats = await this.stat(fpath);
          const dirent: nfs.Dirent = {
            name: fname,
            isFile: stats.isFile.bind(stats),
            isDirectory: stats.isDirectory.bind(stats),
            isSymbolicLink: stats.isSymbolicLink.bind(stats),
            isBlockDevice: stats.isBlockDevice.bind(stats),
            isCharacterDevice: stats.isCharacterDevice.bind(stats),
            isFIFO: stats.isFIFO.bind(stats),
            isSocket: stats.isSocket.bind(stats),
          };
          return dirent;
        }),
      );
    }
    return names;
  }

  public async mkdir(p: string, options?: { mode?: number; recursive?: boolean }): Promise<void> {
    const mode = options?.mode ?? 777;
    const recursive = options?.recursive ?? false;
    if (!recursive) {
      await pify(this.fs.mkdir.bind(this.fs))(p, mode);
      return;
    }
    throw new Error('Method `fs.mkdir(path, { recursive: true })` not implemented');
    // TODO: need unit tests
    // let [_, ...parts] = p.split('/');
    // let currentPath = '/';
    // for (let index = 0; index < parts.length; index += 1) {
    //   currentPath = path.join(currentPath, parts[index]);
    //   const exists = await this.exists(currentPath);
    //   if (!exists) {
    //     await pify(this.fs.mkdir.bind(this.fs))(currentPath, mode);
    //   }
    // }
  }

  public async rmdir(p: string, options?: { recursive?: boolean }): Promise<void> {
    const recursive = options?.recursive ?? false;
    const stats = await this.stat(p);
    if (!stats.isDirectory()) {
      throw this.ApiError.ENOTDIR(p);
    }
    if (!recursive) {
      await pify(this.fs.rmdir.bind(this.fs))(p);
    } else {
      const entries = await this.readdir(p, { withFileTypes: true });
      await Promise.all(
        entries.map((entry) => {
          const entryPath = path.join(p, entry.name);
          if (entry.isDirectory()) {
            return this.rmdir(entryPath, { recursive: true });
          } else {
            return this.rm(entryPath, { force: true });
          }
        }),
      );
      await pify(this.fs.rmdir.bind(this.fs))(p);
    }
  }

  // #endregion

  // #region TODO: symlinks
  // #endregion
}
