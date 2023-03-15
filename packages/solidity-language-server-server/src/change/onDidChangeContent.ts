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
};
