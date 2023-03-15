import { InitializeResult, TextDocumentSyncKind, DiagnosticSeverity } from 'vscode-languageserver/browser';
import { FOnInitialize } from '../types';

export const onInitialize: FOnInitialize = (_state) => async (params) => {
  console.log('initialize:', params);
  const result: InitializeResult = {
    serverInfo: {
      name: 'Solidity Language Server',
      version: '0.0.0',
    },
    capabilities: {
      textDocumentSync: TextDocumentSyncKind.Incremental,
      // Tell the client that this server supports code completion.
      completionProvider: {
        // resolveProvider: true,
        triggerCharacters: ['.', '/', '"', `'`, '*'],
      },
      signatureHelpProvider: {
        triggerCharacters: ['(', ','],
      },
      definitionProvider: true,
      // typeDefinitionProvider: false,
      // referencesProvider: false,
      // implementationProvider: false,
      // renameProvider: false,
      // codeActionProvider: false,
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

  _state.indexedWorkspaceFolders = params.workspaceFolders || [];
  self.workspaceFolders = _state.indexedWorkspaceFolders;

  return result;
};
