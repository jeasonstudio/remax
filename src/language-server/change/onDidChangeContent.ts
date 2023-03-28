import { TextDocument } from 'vscode-languageserver-textdocument';
import { TextDocuments } from 'vscode-languageserver/browser';
import { Context } from '../context';
import { debounce } from '../utils';

type OnDidChangeContent = Parameters<TextDocuments<TextDocument>['onDidChangeContent']>[0];

export const onDidChangeContent =
  (ctx: Context): OnDidChangeContent =>
  ({ document }) => {
    const uri = document.uri;
    if (document.languageId !== 'solidity' || !uri) {
      return;
    }

    const content = document.getText();

    const updateSolidityDocument = debounce(() => {
      ctx.updateDocument(uri, content);
    }, 500);

    try {
      updateSolidityDocument();
      // TODO: validate solidity document via solc-js
    } catch (error) {
      ctx.console.error(error);
    }

    // _state.documents.keys().forEach((uri) => {
    //   console.log('send', uri);
    //   _state.connection.sendDiagnostics({
    //     uri,
    //     diagnostics: [
    //       {
    //         message: 'test',
    //         severity: DiagnosticSeverity.Error,
    //         range: { start: { line: 0, character: 0 }, end: { line: 0, character: 5 } },
    //       },
    //     ],
    //   });
    // });
  };
