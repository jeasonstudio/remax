import * as vscode from 'vscode';

export class RemaxWelcomeWebviewPanelSerializer implements vscode.WebviewPanelSerializer {
  public panel!: vscode.WebviewPanel;
  public constructor() {
    const column = vscode.window.activeTextEditor ? vscode.window.activeTextEditor.viewColumn : undefined;
    this.panel = vscode.window.createWebviewPanel('remax.webview-welcome', 'Welcome', column || vscode.ViewColumn.One);
    this.panel.title = 'Welcome';
    this.panel.webview.html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
  
      </head>
      <body>
        <h1>Remax</h1>
      </body>
      </html>
    `;
  }
  public async deserializeWebviewPanel(webviewPanel: vscode.WebviewPanel, state: unknown): Promise<void> {}
  public show() {
    return this.panel.reveal();
  }
}
