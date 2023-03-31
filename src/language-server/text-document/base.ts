import { Position, Range, TextDocument } from 'vscode-languageserver-textdocument';

// FullTextDocument
// See: https://github.com/microsoft/vscode-languageserver-node/blob/main/textDocument/src/main.ts#L194
export class SolidityBaseTextDocument implements TextDocument {
  // Source(FullTextDocument)
  public _textDocument!: TextDocument;

  public constructor(uri: string, languageId: string, version: number, content: string) {
    this._textDocument = TextDocument.create(uri, languageId, version, content);
  }

  public get uri(): string {
    return this._textDocument.uri;
  }
  public get languageId(): string {
    return this._textDocument.languageId;
  }
  public get version(): number {
    return this._textDocument.version;
  }
  public get lineCount(): number {
    return this._textDocument.lineCount;
  }

  public getText(range?: Range | undefined): string {
    return this._textDocument.getText(range);
  }
  public positionAt(offset: number): Position {
    return this._textDocument.positionAt(offset);
  }
  public offsetAt(position: Position): number {
    return this._textDocument.offsetAt(position);
  }
}
