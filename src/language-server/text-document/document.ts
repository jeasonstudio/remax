import { Connection, Position, Range, TextDocumentContentChangeEvent } from 'vscode-languageserver/browser';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { SolidityBaseTextDocument } from './base';
import { astTypes, ICompileError, parser, parserTypes, tokenize, compile } from '../utils';

export class SolidityTextDocument extends SolidityBaseTextDocument implements TextDocument {
  public static create(uri: string, languageId: string, version: number, content: string): SolidityTextDocument {
    return new SolidityTextDocument(uri, languageId, version, content);
  }
  public static update(
    document: SolidityTextDocument,
    changes: TextDocumentContentChangeEvent[],
    version: number,
  ): SolidityTextDocument {
    if (document instanceof SolidityTextDocument) {
      document.update(changes, version);
      return document;
    } else {
      throw new Error('SolidityTextDocument.update: document must be created by SolidityTextDocument.create');
    }
  }
  public static applyEdits = TextDocument.applyEdits;
  // Modify connection to another instance
  public static conn = (connection: Connection): any => {
    const events: Array<keyof Connection> = [
      'onDidOpenTextDocument',
      'onDidChangeTextDocument',
      // 'onDidCloseTextDocument', // DO NOTHING WHEN CLOSE DOCUMENT
      'onWillSaveTextDocument',
      'onWillSaveTextDocumentWaitUntil',
      'onDidSaveTextDocument',
    ];
    return {
      ...Object.fromEntries(events.map((eventName) => [eventName, (connection[eventName] as any).bind(connection)])),
      onDidCloseTextDocument: () => {},
    };
  };

  // File AST parsed by `solidity-parser`
  public ast: astTypes.ASTNode = { type: 'SourceUnit', children: [] };
  // File token list
  public tokens: parserTypes.Token[] = [];
  // Import nodes
  public imports: astTypes.ImportDirective[] = [];
  // Contract definition nodes
  public contracts: astTypes.ContractDefinition[] = [];
  // Compile errors
  public compileErrors: ICompileError[] = [];

  public constructor(uri: string, languageId: string, version: number, content: string) {
    super(uri, languageId, version, content);
    this._syncParsedAST();
  }

  public update(changes: TextDocumentContentChangeEvent[], version: number): void {
    (this._textDocument as any).update(changes, version);
    this._syncParsedAST();
  }

  /**
   * sync ast to document
   */
  private async _syncParsedAST() {
    try {
      const content = this.getText();
      if (!content) {
        return;
      }
      this.ast = parser.parse(content, { range: true, tolerant: true, tokens: false, loc: true });
      this.tokens = tokenize(content);

      const imports: astTypes.ImportDirective[] = [];
      const contracts: astTypes.ContractDefinition[] = [];
      this.visit({
        ImportDirective: (node) => {
          if (node?.path) {
            imports.push(node);
          }
        },
        ContractDefinition: (node) => {
          contracts.push(node);
        },
      });
      this.imports = imports;
      this.contracts = contracts;
    } catch (error) {
      if (error instanceof parser.ParserError) {
        console.info('parser error:', error.message);
      } else {
        throw error;
      }
    }
  }

  /**
   * Get contract definition node by position offset
   * @param offset position offset
   * @returns contract definition node
   */
  public getContractByOffset(offset: number): astTypes.ContractDefinition | undefined {
    const contractNode = this.contracts.find((contract) => {
      return contract.range![0] <= offset && offset <= contract.range![1];
    });
    return contractNode;
  }

  public offsetToPositionRange(start: number, end: number): Range {
    return Range.create(this.positionAt(start), this.positionAt(end));
  }

  /**
   * Visit current document's AST
   * @param visitor
   * @param nodeParent
   */
  public visit(visitor: astTypes.ASTVisitor, nodeParent?: astTypes.ASTNode) {
    parser.visit(this.ast, visitor, nodeParent);
  }
}
