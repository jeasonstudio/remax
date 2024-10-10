import * as vscode from "vscode";
import { FileSystemProvider } from "./provider";

/**
 * 激活文件系统扩展。
 *
 * @param context - 由 VS Code 提供的扩展上下文。
 * 
 * 此函数使用方案 "zenfs" 注册一个文件系统提供者。
 * 提供者区分大小写且不是只读的。
 */
export async function activate(context: vscode.ExtensionContext) {
  // Register file system provider
  const provider = new FileSystemProvider();
  context.subscriptions.push(
    vscode.workspace.registerFileSystemProvider("zenfs", provider, {
      isCaseSensitive: true,
      isReadonly: false,
    }),
  );
}

export async function deactivate() {}
