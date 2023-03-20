import { DiagnosticSeverity } from 'vscode-languageserver/browser';
import { FOnDidChangeContent } from '../types';
import { debounce } from '../utils';

export const onDidChangeContent: FOnDidChangeContent = (_state) => (change) => {
  const uri = change.document.uri;

  if (change.document.languageId !== 'solidity' || !uri) {
    return;
  }

  const updateSolidityDocument = debounce(() => {
    _state.updateSolidityDocument(change.document);
  }, 500);

  try {
    updateSolidityDocument();
    // TODO: validate solidity document via solc-js
  } catch (error) {
    _state.traceError(error);
  }

  _state.documents.keys().forEach((uri) => {
    console.log('send', uri);
    _state.connection.sendDiagnostics({
      uri,
      diagnostics: [
        {
          message: 'test',
          severity: DiagnosticSeverity.Error,
          range: { start: { line: 0, character: 0 }, end: { line: 0, character: 5 } },
        },
      ],
    });
  });
};
