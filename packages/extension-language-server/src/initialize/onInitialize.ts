import { TextDocumentSyncKind, Connection } from 'vscode-languageserver/browser';
import { Context } from '../context';

type OnInitialize = Parameters<Connection['onInitialize']>[0];

export const onInitialize =
  (ctx: Context): OnInitialize =>
  async (params) => {
    console.log('onInitialize', params);
    const result: ReturnType<OnInitialize> = {
      serverInfo: {
        name: 'Solidity Language Server',
      },
      capabilities: {
        textDocumentSync: {
          save: true,
          openClose: true,
          change: TextDocumentSyncKind.Full,
          willSave: false,
          willSaveWaitUntil: false,
        },
        // Tell the client that this server supports code completion.
        // completionProvider: {
        //   // resolveProvider: true,
        //   triggerCharacters: ['.', '/', '"', `'`, '*', ' '],
        // },
        // signatureHelpProvider: {
        //   triggerCharacters: ['('],
        // },
        definitionProvider: true,
        hoverProvider: true,
        codeLensProvider: {
          resolveProvider: false,
          workDoneProgress: false,
        },
        // typeDefinitionProvider: true,
        // referencesProvider: true,
        // implementationProvider: true,
        // renameProvider: true,
        // codeActionProvider: true,

        // workspace capabilities
        // workspace: {
        //   workspaceFolders: {
        //     supported: true,
        //     changeNotifications: true,
        //   },
        // },
      },
    };

    return result;
  };
