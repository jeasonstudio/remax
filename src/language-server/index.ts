import {
  BrowserMessageReader,
  BrowserMessageWriter,
  createConnection,
  ProgressType,
  TextDocuments,
} from 'vscode-languageserver/browser';
import { SolidityTextDocument } from './text-document';
import { onCompletion } from './completion';
import { onExit, onInitialize, onInitialized } from './initialize';
import { onDidChangeContent, onDidChangeWatchedFiles } from './change';
import { onSignatureHelp } from './signature';
import { onDefinition, onHover } from './definition';
import { Context } from './context';

const messageReader = new BrowserMessageReader(self);
const messageWriter = new BrowserMessageWriter(self);

const connection = createConnection(messageReader, messageWriter);
const documents = new TextDocuments(SolidityTextDocument);
const context = new Context(connection, documents);
(self as any).ctx = context;

// Lifecycle hooks
connection.onInitialize(onInitialize(context));
connection.onInitialized(onInitialized(context));
connection.onExit(onExit(context));

// Command hooks
connection.onCompletion(onCompletion(context));
connection.onSignatureHelp(onSignatureHelp(context));
connection.onDefinition(onDefinition(context));
// connection.onTypeDefinition(onTypeDefinition(serverState));
// connection.onReferences(onReferences(serverState));
// connection.onImplementation(onImplementation(serverState));
// connection.onRenameRequest(onRename(serverState));
// connection.onCodeAction(onCodeAction(serverState));
connection.onHover(onHover(context));

// changes
connection.onDidChangeWatchedFiles(onDidChangeWatchedFiles(context));
documents.onDidChangeContent(onDidChangeContent(context));
documents.listen(SolidityTextDocument.conn(connection));

// Listen on the connection
connection.listen();
