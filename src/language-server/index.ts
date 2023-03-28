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
import { RemaxFileSystem } from '../file-system';
import { Context } from './context';

const messageReader = new BrowserMessageReader(self);
const messageWriter = new BrowserMessageWriter(self);

const connection = createConnection(messageReader, messageWriter);
const documents = new TextDocuments(TextDocument);
const context = new Context(connection, documents);
(self as any).ctx = context;

// Lifecycle hooks
connection.onInitialize(onInitialize(context));
connection.onInitialized(onInitialized(context));
connection.onExit(onExit(context));

// Command hooks
connection.onCompletion(onCompletion(context));
connection.onSignatureHelp(onSignatureHelp(context));
// connection.onDefinition(onDefinition(state));
// connection.onTypeDefinition(onTypeDefinition(serverState));
// connection.onReferences(onReferences(serverState));
// connection.onImplementation(onImplementation(serverState));
// connection.onRenameRequest(onRename(serverState));
// connection.onCodeAction(onCodeAction(serverState));
// connection.onHover(onHover(state));

// changes
connection.onDidChangeWatchedFiles(onDidChangeWatchedFiles(context));
documents.listen(connection);
documents.onDidChangeContent(onDidChangeContent(context));

// Listen on the connection
connection.listen();
