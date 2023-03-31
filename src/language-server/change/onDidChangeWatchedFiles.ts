import { Connection, FileChangeType } from 'vscode-languageserver/browser';
import { Context } from '../context';

type OnDidChangeWatchedFiles = Parameters<Connection['onDidChangeWatchedFiles']>[0];

export const onDidChangeWatchedFiles =
  (ctx: Context): OnDidChangeWatchedFiles =>
  ({ changes }) => {
    console.log('watched file changes:', changes);
  };
