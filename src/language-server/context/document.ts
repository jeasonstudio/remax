import { TextDocument } from 'vscode-languageserver-textdocument';
import { parser, tokenize, astTypes, parserTypes } from '../utils/parser';

export class SolidityDocument {
  public uri!: string;
  public content!: string;
  public ast!: astTypes.ASTNode;
  public tokens!: parserTypes.Token[];

  public imports: astTypes.ImportDirective[] = [];
  public contracts: astTypes.ContractDefinition[] = [];

  public constructor(uri: string, content: string) {
    this.uri = uri;
    this.update(content);
  }

  public update(content: string) {
    try {
      if (content === this.content) {
        return;
      }
      this.content = content;
      this.ast = parser.parse(this.content, { range: true, tolerant: true, tokens: false, loc: true });
      this.tokens = tokenize(this.content);

      const imports: astTypes.ImportDirective[] = [];
      const contracts: astTypes.ContractDefinition[] = [];
      parser.visit(this.ast, {
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
      console.warn(error);
    }
  }

  public getContractByOffset(offset: number): astTypes.ContractDefinition | undefined {
    const contractNode = this.contracts.find((contract) => {
      return contract.range![0] <= offset && offset <= contract.range![1];
    });
    return contractNode;
  }
}
