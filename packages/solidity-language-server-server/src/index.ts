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
import { onSignatureHelp } from './signature';
import { onDefinition, onHover } from './definition';

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
connection.onCompletion(onCompletion(state));
connection.onSignatureHelp(onSignatureHelp(state));
connection.onDefinition(onDefinition(state));
// connection.onTypeDefinition(onTypeDefinition(serverState));
// connection.onReferences(onReferences(serverState));
// connection.onImplementation(onImplementation(serverState));
// connection.onRenameRequest(onRename(serverState));
// connection.onCodeAction(onCodeAction(serverState));
connection.onHover(onHover(state));

// changes
connection.onDidChangeWatchedFiles(onDidChangeWatchedFiles(state));
documents.listen(connection);
documents.onDidChangeContent(onDidChangeContent(state));

// Listen on the connection
connection.listen();
