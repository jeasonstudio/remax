import { Connection, Position, TextDocuments, URI, WorkspaceFolder } from 'vscode-languageserver/browser';
import { TextDocument } from 'vscode-languageserver-textdocument';
import type * as parser from '@solidity-parser/parser';
import type { ASTNode } from '@solidity-parser/parser/dist/src/ast-types';
import type { Node, Token } from '@solidity-parser/parser/dist/src/types';

export type Documents = TextDocuments<TextDocument>;

export type SolidityParser = typeof parser;
export * from '@solidity-parser/parser/dist/src/ast-types';
export * from '@solidity-parser/parser/dist/src/types';

export interface ISolidityDocument extends TextDocument {
  ast: ASTNode | null;
  errors: any[];
  tokens: Token[];
}

export interface IState {
  env: 'production' | 'development';
  connection: Connection;
  documents: Documents;
  parser: SolidityParser;
  indexedWorkspaceFolders: WorkspaceFolder[];
  uriSolidityDocumentMap: Map<URI, ISolidityDocument>;

  // context utils
  traceError(error: unknown): void;
  updateSolidityDocument(document: TextDocument): void;
  getPositionNodes(uri: URI, position: Position): ASTNode[];
  getOffsetNodes(uri: URI, offset: number): ASTNode[];
  getOffsetToken(textDocument: TextDocument, offset: number): Token | null;
}

export type FHook<F extends (...argv: any) => any> = (state: IState) => Parameters<F>[0];

export type FOnInitialize = FHook<Connection['onInitialize']>;
export type FOnInitialized = FHook<Connection['onInitialized']>;
export type FOnExit = FHook<Connection['onExit']>;
export type FOnCompletion = FHook<Connection['onCompletion']>;
export type FOnDidChangeWatchedFiles = FHook<Connection['onDidChangeWatchedFiles']>;

export type FOnDidChangeContent = FHook<Documents['onDidChangeContent']>;
