import {
  BrowserMessageReader,
  BrowserMessageWriter,
  createConnection,
  TextDocuments,
} from 'vscode-languageserver/browser';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { onCompletion } from './completion';
import { onExit, onInitialize, onInitialized } from './initialize';
import { onDidChangeContent, onDidChangeWatchedFiles } from './change';
import { State } from './state';

const messageReader = new BrowserMessageReader(self);
const messageWriter = new BrowserMessageWriter(self);

const connection = createConnection(messageReader, messageWriter);
const documents = new TextDocuments(TextDocument);
const state = new State(connection, documents);

// Lifecycle hooks
connection.onInitialize(onInitialize(state));
connection.onInitialized(onInitialized(state));
connection.onExit(onExit(state));

// Command hooks
// connection.onSignatureHelp();
connection.onCompletion(onCompletion(state));
// connection.onDefinition(onDefinition(serverState));
// connection.onTypeDefinition(onTypeDefinition(serverState));
// connection.onReferences(onReferences(serverState));
// connection.onImplementation(onImplementation(serverState));
// connection.onRenameRequest(onRename(serverState));
// connection.onCodeAction(onCodeAction(serverState));
// connection.onHover(onHover(serverState));

// changes
documents.onDidChangeContent(onDidChangeContent(state));
connection.onDidChangeWatchedFiles(onDidChangeWatchedFiles(state));
documents.listen(connection);

// Listen on the connection
connection.listen();
