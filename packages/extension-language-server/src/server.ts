import {
  BrowserMessageReader,
  BrowserMessageWriter,
  createConnection,
} from 'vscode-languageserver/browser';
import { SolidityTextDocument } from './text-document';
import { TextDocuments } from '@remax-ide/common/text-documents';
// import { onCompletion } from './completion';
import { onExit, onInitialize, onInitialized } from './initialize';
import { Context } from './context';
import { onDefinition, onHover } from './definition';
import { onCodeLens } from './code-lens';

require('debug').enable(`remax:*`);

const messageReader = new BrowserMessageReader(self);
const messageWriter = new BrowserMessageWriter(self);

const connection = createConnection(messageReader, messageWriter);
const documents = new TextDocuments(SolidityTextDocument);
const context = new Context(connection, documents);

// Lifecycle hooks
connection.onInitialize(onInitialize(context));
connection.onInitialized(onInitialized(context));
connection.onExit(onExit(context));

// Command hooks
// connection.onCompletion(onCompletion(context));
// connection.onSignatureHelp(onSignatureHelp(context));
connection.onDefinition(onDefinition(context));
connection.onHover(onHover(context));
connection.onCodeLens(onCodeLens(context));
// connection.onTypeDefinition(onTypeDefinition(serverState));
// connection.onReferences(onReferences(serverState));
// connection.onImplementation(onImplementation(serverState));
// connection.onRenameRequest(onRename(serverState));
// connection.onCodeAction(onCodeAction(serverState));

documents.listen(connection);
// documents.onDidOpen(onDidOpen(context));
// documents.onDidChangeContent(onDidChangeContent(context));

// Listen on the connection
connection.listen();
