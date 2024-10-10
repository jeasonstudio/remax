import * as vscode from "vscode";

export async function activate(context: vscode.ExtensionContext) {
  // const gitSCM = vscode.scm.createSourceControl("git", "Git");
  // const index = gitSCM.createResourceGroup("index", "Index");
  // function createResourceUri(relativePath: string): vscode.Uri {
  //   return vscode.Uri.file(relativePath);
  // }
  // index.resourceStates = [
  //   { resourceUri: createResourceUri("README.md") },
  //   { resourceUri: createResourceUri("src/test/api.ts") },
  // ];

  // const workingTree = gitSCM.createResourceGroup("workingTree", "Changes");
  // workingTree.resourceStates = [
  //   { resourceUri: createResourceUri(".travis.yml") },
  //   { resourceUri: createResourceUri("README.md") },
  // ];
}

export async function deactivate() {}
