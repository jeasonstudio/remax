declare module 'remax:file-system' {
  import * as fs from 'fs';
  import * as fsPromises from 'fs/promises';
  export type RemaxFileSystem = typeof fs;
  export type RemaxFileSystemPromises = typeof fsPromises;

  export type * from 'fs';
  export type * from 'fs/promises';
}
