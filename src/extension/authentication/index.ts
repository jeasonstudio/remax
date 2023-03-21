import * as vscode from 'vscode';
import { Web3AuthenticationProvider } from './provider';

export async function activate(context: vscode.ExtensionContext) {
  console.log((<any>self).ethereum);

  context.subscriptions.push(
    vscode.authentication.registerAuthenticationProvider(
      'web3-authentication-provider',
      'Connect Wallet',
      new Web3AuthenticationProvider(context.secrets),
    ),
  );
}

export async function deactivate() {}
