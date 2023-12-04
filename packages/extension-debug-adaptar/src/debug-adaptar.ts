import * as vscode from 'vscode';

export class SolidityDebugAdapter implements vscode.DebugAdapter {
  private readonly _onDidSendMessage: vscode.EventEmitter<vscode.DebugProtocolMessage> =
    new vscode.EventEmitter<vscode.DebugProtocolMessage>();
  readonly onDidSendMessage: vscode.Event<vscode.DebugProtocolMessage> =
    this._onDidSendMessage.event;

  handleMessage(message: vscode.DebugProtocolMessage): void {
    // TODO: Handle the message from VS Code

    console.log('handleMessage', message);

    // Send a response back to VS Code
    this._onDidSendMessage.fire(message);
  }

  dispose(): void {
    this._onDidSendMessage.dispose();
  }
}
