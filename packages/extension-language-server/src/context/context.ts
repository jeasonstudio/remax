import { Connection } from 'vscode-languageserver/browser';
import { TextDocuments } from '@remax-ide/common/text-documents';
import { SolidityTextDocument } from '../text-document';

export class Context {
  public constructor(
    // VSCode Language Server Connection
    public readonly connection: Connection,
    // VSCode Text Documents
    public readonly documents: TextDocuments<SolidityTextDocument>,
  ) {}
}
