import {
  BrowserMessageReader,
  BrowserMessageWriter,
  createConnection,
  DiagnosticSeverity,
  Range,
  TextDocumentSyncKind,
  WorkspaceFolder,
} from 'vscode-languageserver/browser';
import * as vscodeUri from 'vscode-uri';
import wrapper from 'solc/wrapper';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { TextDocuments } from '@remax-ide/common/text-documents';
import { debounce } from '@remax-ide/common/lodash';
import { enableDebug, createDebug } from '@remax-ide/common/debug';
import { CompileCommandParams, CompileInput, CompileOutput } from './interface';

const debug = createDebug('extension:compiler');
enableDebug(`*`);

const messageReader = new BrowserMessageReader(self);
const messageWriter = new BrowserMessageWriter(self);
const connection = createConnection(messageReader, messageWriter);
const documents = new TextDocuments(TextDocument);
const workspaces: WorkspaceFolder[] = [];

// let version: string = defaultVersion;
let compiler: any = null;

const resolver = (entryUri: string) => (uri: string) => {
  const toUri = vscodeUri.URI.parse(uri);

  if (['https', 'http'].includes(toUri.scheme)) {
    return { error: 'online dependencies are not safe, please download to workspace' };
  }

  const document = documents.resolve(entryUri, toUri.path);
  if (document?.uri) {
    return { contents: document.getText() };
  }
  return { error: 'not found' };
};

connection.onInitialize(({ initializationOptions, workspaceFolders }) => {
  debug('initialize', initializationOptions, workspaceFolders);
  workspaces.push(...workspaceFolders);
  // if (versionMap[initializationOptions?.version]) {
  //   version = versionMap[initializationOptions?.version];
  // } else {
  //   console.warn('version not supported, fallback to default version:', defaultVersion);
  // }

  if (!initializationOptions?.version) {
    throw new Error("version not found, please check your extension's configuration.");
  }

  const solcUrl = initializationOptions?.version;

  // importScripts(
  //   `https://gw.alipayobjects.com/as/g/ant-baas/solcjs-cdn/1.0.6/soljson-v0.4.24.6eda33a0.js`,
  // );
  // importScripts(`https://g.alipay.com/@alipay/mychain-solidity@2.0.0/soljson-v0.6.4.e5d6ccb5.js`);
  // importScripts(`https://g.alipay.com/@alipay/mychain-solidity@2.0.0/soljson-v0.8.14.685c6bdd.js`);
  importScripts(solcUrl);
  compiler = wrapper((<any>globalThis).Module);

  return {
    capabilities: {
      textDocumentSync: TextDocumentSyncKind.Full,
      workspace: {},
    },
  };
});

connection.onInitialized(() => {
  console.log('Solidity Language Compiler initialized.');
});

const compile = (uri: string, settings: CompileInput['settings']): CompileOutput => {
  if (!compiler || !documents.has(uri)) {
    // throw new Error('Compiler not initialized or document not found.');
    return {
      sources: {},
      contracts: {},
    };
  }
  const resultString = compiler.compile(
    JSON.stringify({
      language: 'Solidity',
      sources: {
        [uri]: { content: documents.get(uri).getText() },
      },
      settings,
    }),
    { import: resolver(uri) },
  );
  const result = JSON.parse(resultString);
  return result;
};

const validate = (document: TextDocument) => {
  try {
    const uri = document.uri;
    const settings: CompileInput['settings'] = {
      outputSelection: {
        '*': {
          '*': ['*'],
          '': ['ast'],
        },
      },
      optimizer: {
        enabled: false,
        runs: 200,
      },
    };
    const result = compile(uri, settings);
    const currentErrors = (result?.errors || []).filter(
      ({ sourceLocation }) => sourceLocation?.file === uri,
    );

    if (currentErrors.length) debug('validate with errors:', uri, currentErrors);

    connection.sendDiagnostics({
      uri,
      diagnostics: currentErrors.map((error) => {
        let severity: DiagnosticSeverity = DiagnosticSeverity.Error;
        switch (error.severity) {
          case 'warning':
            severity = DiagnosticSeverity.Warning;
            break;
          case 'info':
            severity = DiagnosticSeverity.Information;
            break;
          case 'error':
          default:
            severity = DiagnosticSeverity.Error;
            break;
        }

        const range = Range.create(
          document.positionAt(error?.sourceLocation?.start ?? 0),
          document.positionAt(error?.sourceLocation?.end ?? Number.MAX_SAFE_INTEGER),
        );

        return {
          message: error.message,
          code: error.errorCode,
          source: error.type,
          severity,
          range,
        };
      }),
    });
  } catch (error) {
    // ignore
    debug('validate error', error);
  }
};

const validateDebounced = (timestamp: number = 1000) =>
  debounce((document: TextDocument) => validate(document), timestamp);

documents.listen(connection);
documents.onDidOpen(({ document }) => validate(document));
documents.onDidSave(({ document }) => validate(document));
documents.onDidChangeContent(({ document }) => validateDebounced(1000)(document));
documents.onSync(({ documents: documentList }) => {
  documentList.forEach((document) => validate(document));
});

connection.onRequest('remax.compiler.compile', (params: CompileCommandParams) => {
  const { uri, settings } = params;
  return compile(
    uri,
    settings || {
      outputSelection: {
        '*': {
          '*': ['*'],
          '': ['ast'],
        },
      },
      optimizer: {
        enabled: false,
        runs: 200,
      },
    },
  );
});

connection.listen();
