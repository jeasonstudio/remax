import {
  BrowserMessageReader,
  BrowserMessageWriter,
  Connection,
  createConnection,
  InitializeResult,
  MarkupKind,
  TextDocuments,
  TextDocumentSyncKind,
} from 'vscode-languageserver/browser';
import { TextDocument } from 'vscode-languageserver-textdocument';

const messageReader = new BrowserMessageReader(self);
const messageWriter = new BrowserMessageWriter(self);
const connection = createConnection(messageReader, messageWriter);
const documents = new TextDocuments(TextDocument);
// Make the text document manager listen on the connection
// for open, change and close text document events
documents.listen(connection);

// Lifecycle hooks
connection.onInitialize((params) => {
  console.log('Solidity Language Server initialize:', params);
  const result: InitializeResult = {
    serverInfo: {
      name: 'Solidity Language Server',
    },
    capabilities: {
      textDocumentSync: TextDocumentSyncKind.Incremental,
      // Tell the client that this server supports code completion.
      // completionProvider: {
      //   triggerCharacters: ['.', '/', '"', "'", '*'],
      // },
      // signatureHelpProvider: {
      //   triggerCharacters: ['(', ','],
      // },
      definitionProvider: false,
      typeDefinitionProvider: false,
      referencesProvider: false,
      implementationProvider: false,
      renameProvider: false,
      codeActionProvider: false,
      hoverProvider: true,

      workspace: {
        workspaceFolders: {
          supported: false,
          changeNotifications: false,
        },
      },
    },
  };
  return result;
});
connection.onInitialized(() => {
  console.log('Solidity Language Server initialized.');
});

// Command hooks
// this.connection.onSignatureHelp(this.onSignatureHelp);
// this.connection.onCompletion(this.onCompletion);
// this.connection.onHover(this.onHover);

connection.onExit(() => {
  console.log('Solidity Language Server exit.');
});

// connection.onSignatureHelp();
// connection.onCompletion(onCompletion(serverState));
// connection.onDefinition(onDefinition(serverState));
// connection.onTypeDefinition(onTypeDefinition(serverState));
// connection.onReferences(onReferences(serverState));
// connection.onImplementation(onImplementation(serverState));
// connection.onRenameRequest(onRename(serverState));
// connection.onCodeAction(onCodeAction(serverState));
// connection.onHover(onHover(serverState));

// connection.onDidChangeWatchedFiles(() => {
//   documents.all().forEach((document) => validate(document));
// });

// fetch(
//   'https://binaries.soliditylang.org/bin/soljson-v0.8.19+commit.7dd6d404.js'
// ).then(async (response) => {
//   const blob = await response.blob();
//   console.log(11, blob);
// });

// Listen on the connection
connection.listen();
