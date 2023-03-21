import * as vscode from 'vscode';

export class Web3AuthenticationSession implements vscode.AuthenticationSession {
  id: string = 'web3';
  accessToken: string = 'token';
  account: vscode.AuthenticationSessionAccountInformation = { id: 'account', label: 'account' };
  scopes: readonly string[] = [];
}

export class Web3AuthenticationProvider implements vscode.AuthenticationProvider, vscode.Disposable {
  public constructor(private readonly secretStorage: vscode.SecretStorage) {}

  dispose() {
    throw new Error('Method not implemented.');
  }
  private _eventEmitter = new vscode.EventEmitter<vscode.AuthenticationProviderAuthenticationSessionsChangeEvent>();
  public onDidChangeSessions: vscode.Event<vscode.AuthenticationProviderAuthenticationSessionsChangeEvent> =
    this._eventEmitter.event;

  public async getSessions(scopes?: readonly string[] | undefined): Promise<readonly vscode.AuthenticationSession[]> {
    // throw new Error('Method not implemented.');
    return [];
  }
  createSession(scopes: readonly string[]): Thenable<vscode.AuthenticationSession> {
    throw new Error('Method not implemented.');
  }
  removeSession(sessionId: string): Thenable<void> {
    throw new Error('Method not implemented.');
  }
}
