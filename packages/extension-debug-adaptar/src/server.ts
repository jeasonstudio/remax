import {
  BrowserMessageReader,
  BrowserMessageWriter,
  TextDocumentSyncKind,
  createConnection,
} from 'vscode-languageserver/browser';

const messageReader = new BrowserMessageReader(self);
const messageWriter = new BrowserMessageWriter(self);
const connection = createConnection(messageReader, messageWriter);

connection.onInitialize(({ initializationOptions }) => {
  return {
    capabilities: {
      textDocumentSync: TextDocumentSyncKind.Full,
      workspace: {},
    },
  };
});

connection.listen();
