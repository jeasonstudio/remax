// import {
//   createConnection,
//   BrowserMessageReader,
//   BrowserMessageWriter,
//   TextDocuments,
//   Diagnostic,
//   DiagnosticSeverity,
//   ProposedFeatures,
//   InitializeParams,
//   DidChangeConfigurationNotification,
//   CompletionItem,
//   CompletionItemKind,
//   TextDocumentPositionParams,
//   TextDocumentSyncKind,
//   InitializeResult,
//   ServerCapabilities,
// } from 'vscode-languageserver/browser';
// // import * as vscode from 'vscode';
// // import * as vscodeUri from 'vscode-uri';
// import { TextDocument } from 'vscode-languageserver-textdocument';

// // Create a connection for the server, using Node's IPC as a transport.
// // Also include all preview / proposed LSP features.
// const messageReader = new BrowserMessageReader(self);
// const messageWriter = new BrowserMessageWriter(self);

// const connection = createConnection(messageReader, messageWriter);

// // Create a simple text document manager.
// const documents: TextDocuments<TextDocument> = new TextDocuments(TextDocument);

// // Make the text document manager listen on the connection
// // for open, change and close text document events
// documents.listen(connection);

// connection.onInitialize((params: InitializeParams) => {
//   console.log('Solidity Language Server initialize:', params);
//   const result: InitializeResult = {
//     capabilities: {
//       completionProvider: {
//         resolveProvider: false,
//         triggerCharacters: ['.'],
//       },
//       definitionProvider: true,
//       textDocumentSync: TextDocumentSyncKind.Full,
//     },
//   };
//   return result;
// });

// connection.onInitialized(() => {
//   console.log('Solidity Language Server initialized.');
// });

// connection.onExit(() => {
//   console.log('Solidity Language Server exit.');
// });

// // connection.onSignatureHelp();
// // connection.onCompletion(onCompletion(serverState));
// // connection.onDefinition(onDefinition(serverState));
// // connection.onTypeDefinition(onTypeDefinition(serverState));
// // connection.onReferences(onReferences(serverState));
// // connection.onImplementation(onImplementation(serverState));
// // connection.onRenameRequest(onRename(serverState));
// // connection.onCodeAction(onCodeAction(serverState));
// // connection.onHover(onHover(serverState));

// // connection.onDidChangeWatchedFiles(() => {
// //   documents.all().forEach((document) => validate(document));
// // });

// // https://binaries.soliditylang.org/bin/soljson-v0.8.19+commit.7dd6d404.js
// // fetch('https://binaries.soliditylang.org/wasm/list.json')
// //   .then((res) => res.json())
// //   .then(console.log);

// // Listen on the connection
// connection.listen();
// // }

// // main().catch(console.error);

import 'solidity-language-server-webworker';
