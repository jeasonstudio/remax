import * as vscode from 'vscode';
import { SolidityDebugAdapterDescriptorFactory } from './descriptor-factory';

export async function activate(context: vscode.ExtensionContext) {
  // context.subscriptions.push(
  //   vscode.debug.registerDebugAdapterDescriptorFactory(
  //     'solidity',
  //     new SolidityDebugAdapterDescriptorFactory(),
  //   ),
  // );
}

export async function deactivate() {}
