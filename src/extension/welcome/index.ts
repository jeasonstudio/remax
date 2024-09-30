import * as vscode from "vscode";
import { RemaxWelcomeWebviewPanelSerializer } from "./webview";

export async function activate(context: vscode.ExtensionContext) {
  // const serializer = new RemaxWelcomeWebviewPanelSerializer();
  // context.subscriptions.push(vscode.window.registerWebviewPanelSerializer('remax.webview-welcome', serializer));

  const column = vscode.window.activeTextEditor
    ? vscode.window.activeTextEditor.viewColumn
    : undefined;

  context.subscriptions.push(
    vscode.commands.registerCommand("remax.show-welcome", () => {
      const panel = vscode.window.createWebviewPanel(
        "remax.webview-welcome",
        "Welcome",
        column || vscode.ViewColumn.One,
        {
          retainContextWhenHidden: true,
          enableScripts: true,
        },
      );
      panel.title = "Welcome";
      panel.webview.html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
  
      </head>
      <body>
        <h1>Remax</h1>
      </body>
      </html>
    `;
      panel.reveal();
    }),
  );
}

export async function deactivate() {}
