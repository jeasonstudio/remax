import { URI } from 'vscode-uri';
import path from 'path-browserify';
import { Connection, TextDocuments } from 'vscode-languageserver/browser';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { RemaxFileSystem, NodeDirent } from '../../file-system';
import { FILE_SYSTEM_SCHEME } from '../../constants';
import { SolidityDocument } from './document';
import { Logger } from './logger';
import { astTypes } from '../utils';

export class Context {
  // Workspace name, such as `playground`
  public workspace!: string;
  // Workspace uri, such as `remaxfs:/playground`
  public workspaceUri!: string;
  // mapping(uri => solidityDocument)
  public documentMap: Map<string, SolidityDocument> = new Map();
  // RemaxFS
  public remaxfs!: RemaxFileSystem;
  // Promise for remaxfs
  public remaxfsPromise!: Promise<RemaxFileSystem>;
  // Logger
  public console!: Logger;

  public constructor(
    // VSCode Language Server Connection
    public readonly connection: Connection,
    // VSCode Text Documents
    public readonly documents: TextDocuments<TextDocument>,
  ) {
    this.remaxfsPromise = RemaxFileSystem.init().then((remaxfs) => {
      this.remaxfs = remaxfs;
      return remaxfs;
    });
    this.console = new Logger(connection);
  }

  // Update/Create solidity document
  public async updateDocument(uri: string, contentString?: string) {
    await this.remaxfsPromise;
    const filePath = this.uri2path(uri);
    const content = contentString || (await this.remaxfs.readFile(filePath)).toString('utf8');
    if (this.documentMap.has(uri)) {
      const document = this.documentMap.get(uri);
      document!.update(content);
    } else {
      const document = new SolidityDocument(uri, content);
      this.documentMap.set(uri, document);
    }
  }

  // Delete solidity document
  public async deleteDocument(uri: string) {
    if (this.documentMap.has(uri)) {
      this.documentMap.delete(uri);
    }
  }

  // Sync solidity documnets from filesystem to ctx
  public async syncDocuments(folderPath?: string) {
    await this.remaxfsPromise;
    const fp = folderPath || this.uri2path(this.workspaceUri);
    const formatEntry = async (dir: string, entry: NodeDirent) => {
      const entryPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        // If is directory, recurse
        const entries = await this.remaxfs.readdir(entryPath, { withFileTypes: true });
        await Promise.all(entries.map((e) => formatEntry(entryPath, e)));
      } else if (entry.isFile() && entry.name.endsWith('.sol')) {
        // If is file, update/create document
        const uri = this.path2uri(entryPath);
        await this.updateDocument(uri);
      }
      // Else ignore
    };
    const rootEntries = await this.remaxfs.readdir(fp, { withFileTypes: true });
    await Promise.all(rootEntries.map((e) => formatEntry(fp, e)));

    console.log('sync documents:', this.documentMap);
  }

  // Convert uri to path
  // remaxfs:/playground => /playground
  public uri2path(uri: string) {
    if (uri.startsWith(`${FILE_SYSTEM_SCHEME}:`)) {
      return uri.slice(FILE_SYSTEM_SCHEME.length + 1);
    }
    return URI.parse(uri).path;
  }
  // Convert path to uri
  // /playground => remaxfs:/playground
  public path2uri(p: string) {
    if (p.startsWith('/')) {
      return `${FILE_SYSTEM_SCHEME}:${p}`;
    }
    return p;
  }

  // Resolve from(uri) to target uri
  public resolve(fromUri: string, relativePath: string): string {
    const fromPath = this.uri2path(fromUri);
    const toPath = path.resolve(path.dirname(fromPath), relativePath);
    return this.path2uri(toPath);
  }

  public getImportsList(uri: string): string[] {
    const result: string[] = [];

    const doGetImports = (_uri: string) => {
      const document = this.documentMap.get(uri);
      if (!document) {
        return;
      }
      document.imports.forEach((i) => {
        const target = this.resolve(_uri, i.path);
        if (!result.includes(target)) {
          result.push(target);
          doGetImports(target);
        }
      });
    };
    doGetImports(uri);
    return result;
  }

  // Get the ancestor contracts
  public getAncestorsContracts = (uri: string, name: string): astTypes.ContractDefinition[] => {
    const document = this.documentMap.get(uri);
    const _contract = document?.contracts.find((c) => c.name === name);
    if (!uri || !document || !_contract) {
      return [];
    }
    const importedSolidityFiles = this.getImportsList(document.uri);
    const importedContractMap: Record<string, astTypes.ContractDefinition> = {};
    importedSolidityFiles.forEach((fileUri) => {
      const doc = this.documentMap.get(fileUri);
      if (doc) {
        doc.contracts.forEach((contract) => {
          importedContractMap[contract.name] = contract;
        });
      }
    });

    const relativeContractNames: string[] = [];

    const doGetAncestorContracts = (con: astTypes.ContractDefinition) => {
      if (!con.baseContracts?.length) {
        return;
      }
      con.baseContracts.forEach((baseContract) => {
        const name = baseContract.baseName.namePath;
        const newContract = importedContractMap[name];
        if (newContract) {
          relativeContractNames.push(name);
          doGetAncestorContracts(newContract);
        }
      });
    };
    doGetAncestorContracts(_contract);

    return relativeContractNames.map((n) => importedContractMap[n]).filter(Boolean);
  };
}
