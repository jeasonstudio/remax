import * as vscode from 'vscode';
import { SolidityDebugAdapter } from './debug-adaptar';

export class SolidityDebugAdapterDescriptorFactory implements vscode.DebugAdapterDescriptorFactory {
  createDebugAdapterDescriptor(
    session: vscode.DebugSession,
    executable: vscode.DebugAdapterExecutable | undefined,
  ): vscode.ProviderResult<vscode.DebugAdapterDescriptor> {
    console.log('createDebugAdapterDescriptor', session, executable);
    return new vscode.DebugAdapterInlineImplementation(new SolidityDebugAdapter());
  }
}
