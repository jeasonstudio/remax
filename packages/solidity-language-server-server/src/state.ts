/* eslint-disable @typescript-eslint/naming-convention */
import { Connection, Position, TextDocuments, URI, WorkspaceFolder } from 'vscode-languageserver/browser';
import { TextDocument } from 'vscode-languageserver-textdocument';
import type * as parser from '@solidity-parser/parser';
import { IState, ISolidityDocument, Node, ASTNode, Token } from './types';
import { astVisitPosition } from './utils/astVisitPosition';
import { enterVisitors } from './utils/visitors';

export class State implements IState {
  public env!: 'production' | 'development';
  public indexedWorkspaceFolders: WorkspaceFolder[] = [];
  /**
   * solidity parser
   */
  public parser!: typeof parser;
  /**
   * mapping(URI, SolidityDocument)
   */
  public uriSolidityDocumentMap: Map<string, ISolidityDocument> = new Map();

  public constructor(readonly connection: Connection, readonly documents: TextDocuments<TextDocument>) {
    this.env = 'production';
    self.importScripts('https://unpkg.com/@solidity-parser/parser@0.16.0/dist/index.iife.js');
    this.parser = self.SolidityParser;
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
    const prevDocument = this.uriSolidityDocumentMap.get(uri);
    const content = document.getText();
    if (!prevDocument?.getText || prevDocument?.getText() !== content) {
      const solidityDocument: ISolidityDocument = {
        ast: null,
        errors: [],
        tokens: [],
        ...prevDocument,
        ...document,
      };

      try {
        const parseResult = this.parser.parse(content, { range: true, tolerant: true, tokens: true, loc: true });
        solidityDocument.ast = parseResult;
        solidityDocument.errors = parseResult.errors || [];
        solidityDocument.tokens = parseResult.tokens || [];
      } catch (error) {
        this.traceError(error);
      }

      // set new document
      this.uriSolidityDocumentMap.set(uri, solidityDocument);
      console.log('update document:', uri);
      console.log('update document:', solidityDocument);
      this.connection.console.info('Update document debounced: ' + uri);
    } else {
      this.connection.console.info('Document not changed debounced: ' + uri);
    }
  }

  public getPositionNodes(uri: URI, position: Position) {
    const document = this.uriSolidityDocumentMap.get(uri);
    if (!document || !document.ast) {
      return [];
    }
    const p = {
      // This comment copy from `hardhat-vscode` extension:
      // TODO: Remove +1 when "@solidity-parser" fix line counting.
      // Why +1? Because "vs-code" line counting from 0, and "@solidity-parser" from 1.
      line: position.line + 1,
      column: position.character,
    };

    let targetNodes: ASTNode[] = [];

    const visitDefinition = (n: ASTNode) => {
      if (
        n.loc!.start.line === p.line &&
        n.loc!.end.line === p.line
        // n.loc!.start.column >= p.column &&
        // n.loc!.end.column <= p.column
      ) {
        targetNodes.push(n);
      }
    };

    const visitor = Object.fromEntries(enterVisitors.map((v) => [v, visitDefinition]));
    this.parser.visit(document.ast, visitor);
    return targetNodes;
  }

  public getOffsetNodes(uri: URI, offset: number) {
    const document = this.uriSolidityDocumentMap.get(uri);
    if (!document || !document.ast) {
      return [];
    }

    let targetNodes: ASTNode[] = [];

    const visitDefinition = (n: ASTNode) => {
      const [start, end] = n.range ?? [0, 0];
      if (offset >= start && offset <= end) {
        targetNodes.push(n);
      }
    };

    const visitor = Object.fromEntries(enterVisitors.map((v) => [v, visitDefinition]));
    this.parser.visit(document.ast, visitor);
    return targetNodes;
  }

  public getOffsetToken(textDocument: TextDocument, offset: number): Token | null {
    const content = textDocument.getText();
    const tokens: Token[] = this.parser.tokenize(content, { range: true });

    const token = tokens.find((t) => {
      const [start, end] = t.range ?? [0, 0];
      return offset >= start && offset <= end;
    });
    return token ?? null;
  }
}
