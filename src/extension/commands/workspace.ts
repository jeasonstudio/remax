import * as vscode from 'vscode';
import path from 'path-browserify';
import { FILE_SYSTEM_SCHEME, WORKBENCH_DEFAULT_PLAYGROUND_NAME } from '../../constants';

// manifest.json
export interface IManifest {
  name: string;
  path: string;
  entries?: IManifest[];
}

export const playgroundFolderUri = vscode.Uri.from({
  scheme: FILE_SYSTEM_SCHEME,
  path: path.join('/', WORKBENCH_DEFAULT_PLAYGROUND_NAME),
});

const preparePlayground = async (force?: boolean) => {
  let currentPlaygroundItemsCount: number = 0;
  try {
    await vscode.workspace.fs.stat(playgroundFolderUri);
    const playgroundItems = await vscode.workspace.fs.readDirectory(playgroundFolderUri);
    currentPlaygroundItemsCount = playgroundItems?.length || 0;
    if (force) {
      await vscode.workspace.fs.delete(playgroundFolderUri, { recursive: true, useTrash: false });
    }
  } catch (error) {
    // if playground folder not exists, will throw error, we ignore here
    console.warn(error);
  }
  try {
    const manifestPath = '/playground/manifest.json';
    const manifest = await fetch(`${globalThis.location.origin}${manifestPath}`).then<IManifest>((m) => m.json());

    const doPrepare = async (m: IManifest) => {
      const currentUri = vscode.Uri.joinPath(playgroundFolderUri, m.path);
      const currentPath = path.join(path.dirname(manifestPath), m.path);
      if (m.entries?.length) {
        // means is a folder
        await vscode.workspace.fs.createDirectory(currentUri);
        await Promise.all(m.entries.map(doPrepare));
      } else {
        // means is a file
        const content = await fetch(`${globalThis.location.origin}${currentPath}`).then((c) => c.text());
        await vscode.workspace.fs.writeFile(currentUri, Buffer.from(content));
      }
    };

    if (currentPlaygroundItemsCount && !force) {
      // ignore
    } else {
      await doPrepare(manifest);
    }
  } catch (err) {
    const error = err as unknown as Error;
    console.error(error);
    vscode.window.showErrorMessage(error.message || 'Failed to prepare playground');
  }
};

export async function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand('remax.playground-open', async () => {
      await preparePlayground(false);
      await vscode.commands.executeCommand('vscode.openFolder', playgroundFolderUri);
    }),
    vscode.commands.registerCommand('remax.playground-reset', async () => {
      const yes = 'Yes, I know what I am doing!';
      const no = 'No, I want to keep my playground.';
      vscode.window
        .showQuickPick([yes, no], {
          title: 'This will reset the playground workspace and cannot be restored, are you sure?',
          placeHolder: '(select an option)',
        })
        .then((result) => {
          if (result === yes) {
            preparePlayground(true);
          }
        });
    }),
  );
}

export async function deactivate() {}
