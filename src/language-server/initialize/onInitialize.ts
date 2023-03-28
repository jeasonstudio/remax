import { TextDocumentSyncKind, Connection } from 'vscode-languageserver/browser';
import { Context } from '../context';

type OnInitialize = Parameters<Connection['onInitialize']>[0];

export const onInitialize =
  (ctx: Context): OnInitialize =>
  async (params) => {
    console.log('initialize:', params);
    const result: ReturnType<OnInitialize> = {
      serverInfo: {
        name: 'Solidity Language Server',
        version: '0.0.0',
      },
      capabilities: {
        textDocumentSync: TextDocumentSyncKind.Incremental,
        // Tell the client that this server supports code completion.
        completionProvider: {
          // resolveProvider: true,
          triggerCharacters: ['.', '/', '"', `'`, '*', ' '],
        },
        signatureHelpProvider: {
          triggerCharacters: ['('],
        },
        // definitionProvider: true,
        // typeDefinitionProvider: true,
        // referencesProvider: true,
        // implementationProvider: true,
        // renameProvider: true,
        // codeActionProvider: true,
        hoverProvider: true,

        // workspace capabilities
        workspace: {
          workspaceFolders: {
            supported: true,
            changeNotifications: true,
          },
        },
      },
    };

    if ((params.workspaceFolders?.length ?? 0) >= 1) {
      ctx.workspace = params.workspaceFolders![0].name;
      ctx.workspaceUri = params.workspaceFolders![0].uri;
      await ctx.syncDocuments();
    }

    return result;
  };
