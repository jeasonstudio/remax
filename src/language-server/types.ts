import { Connection, Position, TextDocuments, URI, WorkspaceFolder } from 'vscode-languageserver/browser';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { RemaxFileSystem } from '../file-system';
import type * as parser from '@remax-ide/solidity-parser';
import type { ASTNode } from '@remax-ide/solidity-parser/dist/src/ast-types';
import type { Node, Token } from '@remax-ide/solidity-parser/dist/src/types';

export type Documents = TextDocuments<TextDocument>;

export type SolidityParser = typeof parser;
export * from '@remax-ide/solidity-parser/dist/src/ast-types';
export * from '@remax-ide/solidity-parser/dist/src/types';

export interface IState {
  env: 'production' | 'development';
  connection: Connection;
  documents: Documents;
  remaxfs: RemaxFileSystem;
  indexedWorkspaceFolders: WorkspaceFolder[];
  ast: Map<URI, ASTNode>;
  tokens: Map<URI, Token[]>;

  // context utils
  traceError(error: unknown): void;
  updateSolidityDocument(document: TextDocument): void;
  getOffsetToken(textDocument: TextDocument, offset: number): Token | null;
}

export type FHook<F extends (...argv: any) => any> = (state: IState) => Parameters<F>[0];

export type FOnInitialize = FHook<Connection['onInitialize']>;
export type FOnInitialized = FHook<Connection['onInitialized']>;
export type FOnExit = FHook<Connection['onExit']>;
export type FOnCompletion = FHook<Connection['onCompletion']>;
export type FOnDefinition = FHook<Connection['onDefinition']>;
export type FOnSignatureHelp = FHook<Connection['onSignatureHelp']>;
export type FOnHover = FHook<Connection['onHover']>;
export type FOnDidChangeWatchedFiles = FHook<Connection['onDidChangeWatchedFiles']>;

export type FOnDidChangeContent = FHook<Documents['onDidChangeContent']>;
