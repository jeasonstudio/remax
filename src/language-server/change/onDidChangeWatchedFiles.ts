import { Connection, FileChangeType } from 'vscode-languageserver/browser';
import { Context } from '../context';

type OnDidChangeWatchedFiles = Parameters<Connection['onDidChangeWatchedFiles']>[0];

export const onDidChangeWatchedFiles =
  (ctx: Context): OnDidChangeWatchedFiles =>
  ({ changes }) => {
    if (!changes?.length) {
      return;
    }
    for (let index = 0; index < changes.length; index += 1) {
      const { type, uri } = changes[index];
      switch (type) {
        case FileChangeType.Created:
        case FileChangeType.Changed:
          ctx.updateDocument(uri);
          break;
        case FileChangeType.Created:
          ctx.deleteDocument(uri);
          break;
        default:
          // nothing to do, should not happen
          break;
      }
    }
  };
