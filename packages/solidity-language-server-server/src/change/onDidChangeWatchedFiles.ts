import { FOnDidChangeWatchedFiles } from '../types';

export const onDidChangeWatchedFiles: FOnDidChangeWatchedFiles = (_state) => (change) => {
  const changeStr = change.changes.map((c) => `${c.uri}(${c.type})`).join(',');
  _state.connection.console.info('watched files changed: ' + changeStr);
};
