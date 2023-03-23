import * as BrowserFS from 'browserfs';
import { Buffer } from 'buffer/';
import { FileSystem } from './types';
import { FileSystemBase } from './fs-base';
import { FILE_SYSTEM_NAME } from '../constants';

export class RemaxFileSystem extends FileSystemBase {
  /**
   * You should allways create a new instance of RemaxFileSystem by calling this method.
   * @example const remaxfs = await RemaxFileSystem.init();
   * @returns remaxfs
   */
  public static async init() {
    globalThis.Buffer = Buffer as any;
    const storeName = FILE_SYSTEM_NAME;
    return new Promise<RemaxFileSystem>((resolve, reject) => {
      BrowserFS.FileSystem.IndexedDB.Create({ storeName }, function (idberror, idbfs) {
        if (idberror || !idbfs) {
          reject(idberror);
        } else {
          // Fix: browserfs has a bug that it will not init store successfully.
          idbfs.init((idbfs as any).store, () => {
            const remaxfs = new RemaxFileSystem(idbfs as FileSystem);
            resolve(remaxfs);
          });
        }
      });
    });
  }

  /**
   * Internal use only.
   * @protected
   * @param fs file system
   */
  protected constructor(public readonly fs: FileSystem) {
    super(fs);
  }

  // public buffer2Uint8array = buffer2Uint8array;
  // public uint8Array2Buffer = uint8Array2Buffer;
}
