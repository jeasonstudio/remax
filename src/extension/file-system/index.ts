import * as vscode from "vscode";
import { FileSystemProvider } from "./provider";

export async function activate(context: vscode.ExtensionContext) {
  // Register file system provider
  const provider = new FileSystemProvider();
  context.subscriptions.push(
    vscode.workspace.registerFileSystemProvider("zenfs", provider, {
      isCaseSensitive: true,
      isReadonly: false,
    }),
  );
  // context.subscriptions.push(
  //   vscode.workspace.registerFileSearchProvider("zenfs", provider),
  // );
}

export async function deactivate() {}
