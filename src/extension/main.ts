import type * as vscode from "vscode";
import * as fileSystem from "./file-system";
import * as welcome from "./welcome";

export async function activate(context: vscode.ExtensionContext) {
  try {
    await fileSystem.activate(context);
    await welcome.activate(context);
  } catch (error) {
    console.error(error);
  }
}

export async function deactivate() {
  await fileSystem.deactivate();
  await welcome.deactivate();
}
