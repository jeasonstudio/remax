import * as vscode from 'vscode';
import { RemaxWelcomeWebviewPanelSerializer } from './webview';

export async function activate(context: vscode.ExtensionContext) {
  // const serializer = new RemaxWelcomeWebviewPanelSerializer();
  // context.subscriptions.push(vscode.window.registerWebviewPanelSerializer('remax.webview-welcome', serializer));

  let welcomePanel: vscode.WebviewPanel | undefined = undefined;

  context.subscriptions.push(
    vscode.commands.registerCommand('remax.show-welcome', () => {
      if (welcomePanel) {
        // If we already have a panel, show it in the target column
        welcomePanel.reveal(vscode.ViewColumn.One);
      } else {
        // Otherwise, create a new panel
        welcomePanel = vscode.window.createWebviewPanel('remax.webview-welcome', 'Welcome', vscode.ViewColumn.One, {
          retainContextWhenHidden: true,
          enableScripts: true,
        });
        welcomePanel.webview.html = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
    
        </head>
        <body>
          <h1>Remax</h1>
        </body>
        </html>
      `;

        // Reset when the current panel is closed
        welcomePanel.onDidDispose(
          () => {
            welcomePanel = undefined;
          },
          null,
          context.subscriptions,
        );
      }
      // vscode.commands.executeCommand('workbench.action.pinEditor', welcomePanel);
    }),
  );
}

export async function deactivate() {}
