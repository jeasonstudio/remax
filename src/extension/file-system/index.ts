import * as vscode from "vscode";
import { FileSystemProvider } from "./provider";
import { configureSingle } from "@zenfs/core";
import { IndexedDB, WebAccess } from "@zenfs/dom";

export async function activate(context: vscode.ExtensionContext) {
  // Register file system provider
  const provider = new FileSystemProvider(
    configureSingle({
      backend: IndexedDB,
    }),
  );

  const [project] = vscode.workspace.workspaceFolders!;
  try {
    await provider.stat(project.uri);
  } catch (error) {
    // Create directory if not exists
    await provider.createDirectory(project.uri);
  }

  context.subscriptions.push(
    vscode.workspace.registerFileSystemProvider("zenfs", provider, {
      isCaseSensitive: true,
      isReadonly: false,
    }),
  );
}

export async function deactivate() {}
