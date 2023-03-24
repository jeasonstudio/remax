import { TextDocument } from 'vscode-languageserver-textdocument';
import type { ASTNode, ContractDefinition, ImportDirective } from '@solidity-parser/parser/dist/src/ast-types';
import type { Token } from '@solidity-parser/parser/dist/src/types';
import { parser } from '../utils/parser';

export class Analyzer {
  public version!: number;
  public uri!: string;
  public content!: string;
  public ast!: ASTNode;
  public tokens!: Token[];

  public imports: ImportDirective[] = [];
  public interfaces: ContractDefinition[] = [];
  public contracts: ContractDefinition[] = [];

  public constructor(document: TextDocument) {
    this.update(document);
  }

  public update(document: TextDocument) {
    try {
      const version = document.version;
      if (version === this.version) {
        return;
      }
      this.version = version;
      this.uri = document.uri;
      this.content = document.getText();
      this.ast = parser.parse(this.content, { range: true, tolerant: true, tokens: false, loc: true });
      this.tokens = parser.tokenize(this.content, { range: true, loc: true }) || [];

      const imports: ImportDirective[] = [];
      const interfaces: ContractDefinition[] = [];
      const contracts: ContractDefinition[] = [];
      parser.visit(this.ast, {
        ImportDirective: (node) => {
          if (node?.path) {
            imports.push(node);
          }
        },
        ContractDefinition: (node) => {
          if (node.kind === 'interface') {
            interfaces.push(node);
          } else if (node.kind === 'contract') {
            contracts.push(node);
          }
        },
      });
      this.imports = imports;
      this.interfaces = interfaces;
      this.contracts = contracts;
    } catch (error) {
      console.warn(error);
    }
  }
}
