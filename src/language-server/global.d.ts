// Extends self(window) in worker
interface WorkerGlobalScope {
  SolidityParser: typeof import('@solidity-parser/parser');
  workspaceFolders: import('vscode-languageserver').WorkspaceFolder[];
}
