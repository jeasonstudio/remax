import { Connection, TextDocuments, WorkspaceFolder } from 'vscode-languageserver/browser';
import { TextDocument } from 'vscode-languageserver-textdocument';

export class Context {
  public constructor(
    readonly env: 'production' | 'development',
    readonly connection: Connection,
    readonly documents: TextDocuments<TextDocument>,
    readonly workspaceFolder: WorkspaceFolder,
  ) // indexedWorkspaceFolders: WorkspaceFolder[];
  // projects: SolProjectMap;
  // solFileIndex: SolFileIndexMap;

  // telemetry: Telemetry;
  // logger: Logger;
  // solcVersions: string[];

  // // Associate validation request ids to files to solve parallel validation jobs on the same file
  // validationCount: number;
  // lastValidationId: { [uri: string]: number };
  // workspaceFileRetriever: WorkspaceFileRetriever;
  // cachedCompilerInfo: {
  //   [solcVersion: string]: { isSolcJs: boolean; compilerPath: string };
  // };
  // shownInitializationError: Record<string, boolean>;
  {}
}
