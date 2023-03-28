import { Connection } from 'vscode-languageserver/browser';
import { Context } from '../context';

type OnInitialized = Parameters<Connection['onInitialized']>[0];

export const onInitialized =
  (ctx: Context): OnInitialized =>
  async () => {
    if (ctx.workspaceUri) {
      await ctx.remaxfsPromise;
    }
    console.log('Solidity Language Server initialized.');
    // _state.connection.workspace
  };
