import { createDebug } from '@remax-ide/common/debug';
import { Connection } from 'vscode-languageserver/browser';
import { Context } from '../context';

const debug = createDebug('extension:language-server:onInitialized');

type OnInitialized = Parameters<Connection['onInitialized']>[0];

export const onInitialized =
  (_ctx: Context): OnInitialized =>
  async () => {
    debug('successfully initialized');
  };
