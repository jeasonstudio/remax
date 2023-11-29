import { createDebug } from '@remax-ide/common/debug';
import { Connection } from 'vscode-languageserver/browser';
import { Context } from '../context';

const debug = createDebug('extension:language-server:onExit');

type OnExit = Parameters<Connection['onExit']>[0];

export const onExit =
  (_ctx: Context): OnExit =>
  () => {
    debug('exited');
  };
