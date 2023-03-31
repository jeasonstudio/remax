import { TextDocument } from 'vscode-languageserver-textdocument';
import { TextDocuments } from 'vscode-languageserver/browser';
import { Context } from '../context';
import { debounce } from '../utils';

type OnDidChangeContent = Parameters<TextDocuments<TextDocument>['onDidChangeContent']>[0];

export const onDidChangeContent = (ctx: Context): OnDidChangeContent => {
  const updateSolidityDocument = debounce((uri: string) => {
    ctx.lintDocument(uri);
  }, 500);
  return ({ document }) => {
    const uri = document.uri;
    if (document.languageId !== 'solidity' || !uri) {
      return;
    }

    const content = document.getText();

    try {
      updateSolidityDocument(uri);
      // TODO: validate solidity document via solc-js
    } catch (error) {
      ctx.console.error(error);
    }
  };
};
