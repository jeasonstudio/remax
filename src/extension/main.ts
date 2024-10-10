import type * as vscode from "vscode";
import * as fileSystem from "./file-system";
import * as welcome from "./welcome";
import * as scm from "./scm";

export async function activate(context: vscode.ExtensionContext) {
  await fileSystem.activate(context);
  await welcome.activate(context);
  await scm.activate(context);
}

export async function deactivate() {
  await fileSystem.deactivate();
  await welcome.deactivate();
  await scm.deactivate();
}
