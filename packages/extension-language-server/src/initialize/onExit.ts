import { Connection } from 'vscode-languageserver/browser';
import { Context } from '../context';

type OnExit = Parameters<Connection['onExit']>[0];

export const onExit =
  (ctx: Context): OnExit =>
  () => {
    console.log('Solidity Language Server exited.');
  };
