// Extends self(window) in worker
interface WorkerGlobalScope {
  workspaceFolders: import('vscode-languageserver').WorkspaceFolder[];
}
