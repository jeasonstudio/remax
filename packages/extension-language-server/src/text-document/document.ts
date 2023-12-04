import {
  // Connection,
  Position,
  Range,
  TextDocumentContentChangeEvent,
} from 'vscode-languageserver/browser';
import { createDebug } from '@remax-ide/common/debug';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { SolidityBaseTextDocument } from './base';
import { astTypes, parserTypes, tokenize, parse, visit } from '../utils/parser';
import { Context } from '../context';
import * as vscodeUri from 'vscode-uri';
import { enterVisitors } from '../utils/visitors';
import { ASTContract } from './ast';

const debug = createDebug('extension:language-server:document');

export class SolidityTextDocument extends SolidityBaseTextDocument implements TextDocument {
  public static create(
    uri: string,
    languageId: string,
    version: number,
    content: string,
  ): SolidityTextDocument {
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
      throw new Error(
        'SolidityTextDocument.update: document must be created by SolidityTextDocument.create',
      );
    }
  }
  public static applyEdits = TextDocument.applyEdits;

  public ctx: Context = (<any>self).GlobalContext;

  // File AST parsed by `solidity-parser`
  public ast: astTypes.SourceUnit = { type: 'SourceUnit', children: [] };
  // File token list
  public tokens: parserTypes.Token[] = [];

  // See: https://docs.soliditylang.org/en/v0.8.23/grammar.html#a4.SolidityParser.sourceUnit
  public pragmas: astTypes.PragmaDirective[] = [];
  public imports: SolidityTextDocument[] = [];
  public contracts: ASTContract[] = [];
  public interfaces: ASTContract[] = [];
  public libraries: ASTContract[] = [];

  public constructor(uri: string, languageId: string, version: number, content: string) {
    super(uri, languageId, version, content);
    this.init();
  }

  public update(changes: TextDocumentContentChangeEvent[], version: number): void {
    (this._textDocument as any).update(changes, version); // trick
    this.init();
  }

  /**
   * sync ast to document
   */
  private async init() {
    try {
      const content = this.getText();
      if (!content) return;
      this.ast = parse(content, { range: true, tolerant: true, tokens: false, loc: true });
      this.tokens = tokenize(content);

      this.pragmas = [];
      this.imports = [];
      this.contracts = [];
      this.interfaces = [];
      this.libraries = [];

      for (let index = 0; index < this.ast.children.length; index += 1) {
        const element = this.ast.children[index];
        if (element.type === 'PragmaDirective') {
          this.pragmas.push(element);
        } else if (element.type === 'ImportDirective') {
          this.imports.push(this.resolve(element.path));
        } else if (element.type === 'ContractDefinition') {
          const target = new ASTContract(element);
          switch (element.kind) {
            case 'interface':
              this.interfaces.push(target);
              break;
            case 'library':
              this.libraries.push(target);
              break;
            case 'contract':
            default:
              this.contracts.push(target);
              break;
          }
        }
      }

      // const imports: astTypes.ImportDirective[] = [];
      // const contracts: ASTContract[] = [];

      // visit(this.ast, {
      //   ImportDirective: (node) => {
      //     if (node?.path) imports.push(node);
      //   },
      //   ContractDefinition: (node) => {
      //     contracts.push(new ASTContract(node));
      //   },
      // });
      // this.imports = imports;
      // this.contracts = contracts;

      // debug('init', this.uri, this.tokens);
    } catch (error) {
      // ignore
      console.warn(error);
    }
  }

  /**
   * 从 Tokens 中找到当前位置的 Token
   * @param position vscode position
   * @returns token
   */
  public getTokenAt(position: Position) {
    const offset = this.offsetAt(position);
    const token = this.tokens.find((t) => {
      const [start, end] = t.range ?? [0, 0];
      return offset >= start && offset <= end;
    });
    return token || null;
  }

  /**
   * 根据 ast node 获取在 document 中的位置
   * @param node ast
   * @returns range
   */
  public getNodeRange<T extends astTypes.BaseASTNode>(n?: T): Range {
    return {
      start: this.positionAt(n?.range?.[0] ?? 0),
      end: this.positionAt((n?.range?.[1] ?? 0) + 1),
    };
  }

  /**
   * 从 AST Tree 中找到当前位置的所有 Node List
   * @param position vscode position
   * @returns [Node, ParentNode] List
   */
  public getNodesAt(position: Position, visitors: astTypes.ASTNodeTypeString[] = enterVisitors) {
    const offset = this.offsetAt(position);
    const nodes: [astTypes.ASTNode, astTypes.ASTNode][] = [];
    const visitorFn = (n: astTypes.ASTNode, pn: astTypes.ASTNode = null) => {
      const [start, end] = n.range ?? [0, 0];
      if (offset >= start && offset <= end) {
        nodes.push([n, pn]);
      }
    };
    const visitor = Object.fromEntries(visitors.map((v) => [v, visitorFn]));
    visit(this.ast, visitor);
    return nodes;
  }

  /**
   * 从 AST Tree 中找到当前位置最近的 Node
   * @description visitors 不具有优先级，返回最后一个（最深的）
   * @param position vscode position
   * @param visitors ASTNodeTypeString[]
   * @returns [Node, ParentNode]
   */
  public getNodeAt(position: Position, visitors: astTypes.ASTNodeTypeString[] = enterVisitors) {
    const nodes = this.getNodesAt(position, visitors);
    const [node, parent] = nodes[nodes.length - 1] ?? [null, null];
    return [node, parent] as [astTypes.ASTNode, astTypes.ASTNode];
  }

  public getIdentifierReferenceNode(identifier: astTypes.Identifier) {
    const name = identifier.name;
    const variables: astTypes.VariableDeclaration[] = [];

    visit(this.ast, {
      VariableDeclaration: (n) => {
        if (n.name === name) {
          variables.push(n);
        }
      },
    });

    let offsetGap = Number.MAX_SAFE_INTEGER;
    const offset = identifier.range?.[0] ?? 0;
    let target: astTypes.ASTNode = null;

    // 找到最近的一个并返回
    variables.forEach((variable) => {
      const gap = Math.abs((variable.range?.[0] ?? 0) - offset);
      if (gap < offsetGap) {
        offsetGap = gap;
        target = variable;
      }
    });

    return target;
  }

  /**
   * 从当前文件 resolve 相对路径
   * @param relativePath string 相对当前文件的路径
   * @todo 支持 `node_modules` 等包管理
   */
  public resolve(...paths: string[]) {
    return this.ctx.documents.resolve(this.uri, ...paths);
  }
}
