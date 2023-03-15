/* eslint-disable @typescript-eslint/naming-convention */
import { Connection, Position, TextDocuments, URI, WorkspaceFolder } from 'vscode-languageserver/browser';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { IState, Node, ASTNode, Token } from './types';
import { parser } from './utils';

export class State implements IState {
  public env!: 'production' | 'development';
  public indexedWorkspaceFolders: WorkspaceFolder[] = [];

  public ast: Map<string, ASTNode> = new Map();
  public tokens: Map<string, Token[]> = new Map();

  public constructor(readonly connection: Connection, readonly documents: TextDocuments<TextDocument>) {
    this.env = 'production';
  }

  // Trace error
  public traceError(error: unknown): void {
    if (typeof error === 'string') {
      this.connection.console.error(error);
    } else if (error instanceof Error) {
      this.connection.console.error(error.message);
    } else {
      this.connection.console.error('unknown error: ' + JSON.stringify(error));
    }
  }

  // Update solidity document
  public updateSolidityDocument(document: TextDocument): void {
    const uri = document.uri;
    try {
      const content = document.getText();
      const ast = parser.parse(content, { range: true, tolerant: true, tokens: false, loc: true });
      this.ast.set(uri, ast);
      console.log('update ast:', ast);
      const tokens: Token[] = parser.tokenize(content, { range: true, loc: true }) || [];
      this.tokens.set(uri, tokens);
      console.log('update tokens count:', tokens.length);
    } catch (error) {
      this.traceError(error);
    }
    this.connection.console.info('update document debounced: ' + uri);
  }

  public getOffsetToken(textDocument: TextDocument, offset: number): Token | null {
    const content = textDocument.getText();
    const tokens: Token[] = parser.tokenize(content, { range: true });

    const token = tokens.find((t) => {
      const [start, end] = t.range ?? [0, 0];
      return offset >= start && offset <= end;
    });
    return token ?? null;
  }
}
