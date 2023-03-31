import { URI } from 'vscode-uri';
import path from 'path-browserify';
import { Connection, TextDocuments, DiagnosticSeverity } from 'vscode-languageserver/browser';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { RemaxFileSystem, NodeDirent } from '../../file-system';
import { FILE_SYSTEM_SCHEME } from '../../constants';
import { Logger } from './logger';
import { astTypes, compile, compiler, ICompileInput, ICompileOutput } from '../utils';
import { SolidityTextDocument } from '../text-document';

export class Context {
  // Workspace name, such as `playground`
  public workspace!: string;
  // Workspace uri, such as `remaxfs:/playground`
  public workspaceUri!: string;
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
    public readonly documents: TextDocuments<SolidityTextDocument>,
  ) {
    this.remaxfsPromise = RemaxFileSystem.init().then((remaxfs) => {
      this.remaxfs = remaxfs;
      return remaxfs;
    });
    this.console = new Logger(connection);
  }

  public solidityResolver(uri: string): { contents: string } {
    if (!uri.startsWith(FILE_SYSTEM_SCHEME)) {
      return { contents: '' };
    }
    const document = this.documents.get(uri);
    if (!document) return { contents: '' };
    const contents = document.getText();
    return contents ? { contents } : { contents: '' };
  }

  public lintDocument(uri: string) {
    const document = this.documents.get(uri);
    if (!document) return;
    try {
      const settings: ICompileInput['settings'] = {
        outputSelection: {
          '*': { '*': [] },
        },
      };

      const result = compile(
        {
          language: 'Solidity',
          sources: { [uri]: { content: document.getText() } },
          settings,
        },
        {
          import: this.solidityResolver.bind(this),
        },
      );

      const currentErrors = (result?.errors || []).filter(({ sourceLocation }) => sourceLocation?.file === uri);
      // this.compileErrors = result.errors;
      this.connection.sendDiagnostics({
        uri,
        diagnostics: currentErrors.map((error) => {
          let severity: DiagnosticSeverity = DiagnosticSeverity.Error;
          switch (error.severity) {
            case 'warning':
              severity = DiagnosticSeverity.Warning;
              break;
            case 'info':
              severity = DiagnosticSeverity.Information;
              break;
            case 'error':
            default:
              severity = DiagnosticSeverity.Error;
              break;
          }
          const range = error.sourceLocation
            ? document.offsetToPositionRange(error.sourceLocation.start, error.sourceLocation.end)
            : {
                start: { line: 0, character: 0 },
                end: { line: Number.MAX_SAFE_INTEGER, character: Number.MAX_SAFE_INTEGER },
              };
          return {
            message: `${error.type}: ${error.message}`,
            code: error.errorCode,
            severity,
            range,
          };
        }),
      });
    } catch (error) {}
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
      const document = this.documents.get(uri);
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
  public getAncestorsContracts = (uri: string, name?: string): astTypes.ContractDefinition[] => {
    if (!name) {
      return [];
    }
    const document = this.documents.get(uri);
    const _contract = document?.contracts.find((c) => c.name === name);
    if (!uri || !document || !_contract) {
      return [];
    }
    const importedSolidityFiles = this.getImportsList(document.uri);
    const importedContractMap: Record<string, astTypes.ContractDefinition> = {};
    importedSolidityFiles.forEach((fileUri) => {
      const doc = this.documents.get(fileUri);
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
