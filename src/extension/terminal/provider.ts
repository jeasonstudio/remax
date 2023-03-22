import * as vscode from 'vscode';

class JSConsolePseudoterminal implements vscode.Pseudoterminal {
  private _eventEmitter = new vscode.EventEmitter<string>();
  onDidWrite: vscode.Event<string> = this._eventEmitter.event;

  onDidOverrideDimensions?: vscode.Event<vscode.TerminalDimensions | undefined> | undefined;
  onDidClose?: vscode.Event<number | void> | undefined;
  onDidChangeName?: vscode.Event<string> | undefined;
  open(initialDimensions: vscode.TerminalDimensions | undefined): void;
  open(initialDimensions: vscode.TerminalDimensions | undefined): void;
  open(initialDimensions: unknown): void {
    console.log(initialDimensions);
    this._eventEmitter.fire('Hello world');
    // throw new Error('Method `open` not implemented.');
  }
  close(): void;
  close(): void;
  close(): void {
    throw new Error('Method `close` not implemented.');
  }

  public handleInput(data: string): void {
    console.log(data);
    this._eventEmitter.fire(data);
    // throw new Error('Method `handleInput` not implemented.');
  }
  setDimensions?(dimensions: vscode.TerminalDimensions): void;
  setDimensions?(dimensions: vscode.TerminalDimensions): void;
  setDimensions?(dimensions: unknown): void {
    console.log(dimensions);
    // throw new Error('Method `setDimensions` not implemented.');
  }
}

export class RemaxTerminalProfileProvider implements vscode.TerminalProfileProvider {
  provideTerminalProfile(token: vscode.CancellationToken): vscode.ProviderResult<vscode.TerminalProfile>;
  provideTerminalProfile(token: vscode.CancellationToken): vscode.ProviderResult<vscode.TerminalProfile>;
  provideTerminalProfile(token: unknown): vscode.ProviderResult<vscode.TerminalProfile> {
    return new vscode.TerminalProfile({
      name: 'Remax Terminal',
      pty: new JSConsolePseudoterminal(),
      // shellPath: 'window',
    });
  }
}
