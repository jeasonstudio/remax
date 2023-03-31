// Extends self(window) in worker
interface WorkerGlobalScope {
  // soljson module
  Module: any;
  solcVersion?: string;
  solcPrefix?: string;
  workspaceFolders: import('vscode-languageserver').WorkspaceFolder[];
}

declare module 'solc/*';
