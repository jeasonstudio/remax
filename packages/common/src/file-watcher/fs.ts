import * as vscode from 'vscode';

const fs = vscode.workspace.fs;

export interface SolidityDocuments extends Map<string, string> {}

export const findSolidityFiles = async (
  uri: vscode.Uri,
  files: vscode.Uri[] = [],
): Promise<vscode.Uri[]> => {
  const items = await fs.readDirectory(uri);
  for (let index = 0; index < items.length; index += 1) {
    const [name, type] = items[index];
    switch (type) {
      case 2: // means directory
        await findSolidityFiles(vscode.Uri.joinPath(uri, name), files);
        continue;
      case 1: // means file
        if (name.endsWith('.sol')) files.push(vscode.Uri.joinPath(uri, name));
        continue;
      default:
        continue;
    }
  }
  return files;
};

export const readFileContent = async (uri: vscode.Uri) => {
  const contentBuffer = await fs.readFile(uri);
  return new TextDecoder().decode(contentBuffer);
};
