import * as vscode from 'vscode';
// import * as vscodeUri from 'vscode-uri';
import { LanguageClient, LanguageClientOptions, State } from 'vscode-languageclient/browser';
import { SolidityFileWatcher } from '@remax-ide/common/file-watcher';
import { CompileOutput } from './interface';

// This method is called when your extension is activated
export function createClient(context: vscode.ExtensionContext, url?: string) {
  const fileWatcher = new SolidityFileWatcher();

  // Options to control the language client.
  const clientOptions: LanguageClientOptions = {
    // Register the server for solidity text documents.
    documentSelector: [{ /*scheme: 'file',*/ language: 'solidity', pattern: `**/*.sol` }],
    synchronize: {
      fileEvents: [fileWatcher.fileEvent],
    },
    diagnosticCollectionName: 'solidity',
    initializationOptions: { version: url },
  };

  const serverMain = vscode.Uri.joinPath(context.extensionUri, 'dist/server.js');

  const worker = new Worker(serverMain.toString(true));
  const client = new LanguageClient(
    'solidity',
    'Solidity Language Compiler',
    clientOptions,
    worker,
  );

  fileWatcher.listen(client);

  const compilerStatusItem = vscode.window.createStatusBarItem(
    'compiler-item',
    vscode.StatusBarAlignment.Left,
  );
  compilerStatusItem.text = `$(sync~spin) initializing\tsolidity`;
  context.subscriptions.push(compilerStatusItem);

  client.onDidChangeState(({ newState }) => {
    if (newState === State.Starting) {
      compilerStatusItem.show();
    } else {
      compilerStatusItem.hide();
    }
  });

  context.subscriptions.push(
    vscode.commands.registerCommand('remax.extension-remax.compile', async () => {
      try {
        const result: CompileOutput = await client.sendRequest('remax.compiler.compile', {
          uri: vscode.window.activeTextEditor?.document.uri.toString(),
        });
        const workspaceUri = vscode.workspace.workspaceFolders![0].uri;
        const artifactsUri = vscode.Uri.joinPath(workspaceUri, 'artifacts');
        vscode.workspace.fs.createDirectory(artifactsUri);

        const solidityFiles = Object.keys(result.contracts);
        const jobs: Thenable<void>[] = [];

        for (let index = 0; index < solidityFiles.length; index += 1) {
          const solidityFilePath = solidityFiles[index];
          const solidityFileUri = vscode.Uri.parse(solidityFilePath);
          const solidityFileRelativePath = vscode.workspace.asRelativePath(
            solidityFileUri.fsPath,
            false,
          );
          const solidityFileDistUri = vscode.Uri.joinPath(artifactsUri, solidityFileRelativePath);
          vscode.workspace.fs.createDirectory(solidityFileDistUri);

          const contracts = Object.keys(result.contracts[solidityFilePath]);

          for (let contractIndex = 0; contractIndex < contracts.length; contractIndex += 1) {
            const contractName = contracts[contractIndex];
            const contractBuildResult = result.contracts[solidityFilePath][contractName];
            const buildResultUri = vscode.Uri.joinPath(solidityFileDistUri, `${contractName}.json`);
            const content = new TextEncoder().encode(JSON.stringify(contractBuildResult, null, 2));
            jobs.push(vscode.workspace.fs.writeFile(buildResultUri, content));
          }
        }

        await Promise.all(jobs);
        vscode.window.showInformationMessage('编译成功！');
      } catch (error) {
        console.error(error);
        vscode.window.showErrorMessage('编译失败：', error.message);
      }
    }),
  );

  return client;
}

let languageCompilerClient: LanguageClient | null = null;

export async function activate(context: vscode.ExtensionContext) {
  languageCompilerClient = createClient(context);
  languageCompilerClient.start();

  context.subscriptions.push(
    vscode.commands.registerCommand('remax.extension-remax.switch-solidity-version', async () => {
      const versionSelect = vscode.window.createQuickPick();
      versionSelect.items = [
        {
          label: 'v0.6.4',
          description: 'e5d6ccb5',
          detail: 'https://g.alipay.com/@alipay/mychain-solidity@2.0.0/soljson-v0.6.4.e5d6ccb5.js',
        },
        {
          label: 'v0.8.14',
          description: '685c6bdd',
          detail: 'https://g.alipay.com/@alipay/mychain-solidity@2.0.0/soljson-v0.8.14.685c6bdd.js',
        },
      ];
      versionSelect.onDidChangeSelection((selection) => {
        const url = selection[0].detail!;
        if (languageCompilerClient && languageCompilerClient.state === State.Running) {
          languageCompilerClient = createClient(context, url);
          languageCompilerClient.start();
        } else {
          vscode.window.showInformationMessage('Solidity Language Compiler is not running');
        }
      });
      versionSelect.onDidHide(() => versionSelect.dispose());
      versionSelect.show();
    }),
  );
}

export async function deactivate() {
  if (languageCompilerClient) {
    await languageCompilerClient.stop();
    languageCompilerClient = null;
  }
}
