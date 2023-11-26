import {
  // Connection,
  Position,
  // Range,
  TextDocumentContentChangeEvent,
} from 'vscode-languageserver/browser';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { SolidityBaseTextDocument } from './base';
import { parser, astTypes, parserTypes, tokenize, parse, visit } from '../utils/parser';
import { Context } from '../context';
import * as vscodeUri from 'vscode-uri';
import { enterVisitors } from '../utils/visitors';

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
  public static context: Context;

  // File AST parsed by `solidity-parser`
  public ast: astTypes.ASTNode = { type: 'SourceUnit', children: [] };
  // File token list
  public tokens: parserTypes.Token[] = [];

  // Import nodes
  public imports: astTypes.ImportDirective[] = [];
  // Contract definition nodes
  public contracts: astTypes.ContractDefinition[] = [];

  public constructor(uri: string, languageId: string, version: number, content: string) {
    super(uri, languageId, version, content);
    this.parseDocumentAsync();
  }

  public update(changes: TextDocumentContentChangeEvent[], version: number): void {
    (this._textDocument as any).update(changes, version); // trick
    this.parseDocumentAsync();
  }

  /**
   * sync ast to document
   */
  private async parseDocumentAsync() {
    try {
      const content = this.getText();
      if (!content) return;
      this.ast = parse(content, { range: true, tolerant: true, tokens: false, loc: true });
      this.tokens = tokenize(content);

      const imports: astTypes.ImportDirective[] = [];
      const contracts: astTypes.ContractDefinition[] = [];

      visit(this.ast, {
        ImportDirective: (node) => {
          if (node?.path) imports.push(node);
        },
        ContractDefinition: (node) => {
          contracts.push(node);
        },
      });
      this.imports = imports;
      this.contracts = contracts;
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
   * 从 AST Tree 中找到当前位置的所有 Node List
   * @param position vscode position
   * @returns Node List
   */
  public getNodesAt(position: Position, visitors: astTypes.ASTNodeTypeString[] = enterVisitors) {
    const offset = this.offsetAt(position);
    const nodes: astTypes.ASTNode[] = [];
    const visitorFn = (n: astTypes.ASTNode) => {
      const [start, end] = n.range ?? [0, 0];
      if (offset >= start && offset <= end) {
        nodes.push(n);
      }
    };
    const visitor = Object.fromEntries(visitors.map((v) => [v, visitorFn]));
    visit(this.ast, visitor);

    return nodes;
  }

  /**
   * 从 AST Tree 中找到当前位置最近的 Node
   * @description visitors 具有优先级，越靠前的越优先被选择
   * @param position vscode position
   * @returns Node
   */
  public getNodeAt(position: Position, visitors: astTypes.ASTNodeTypeString[] = enterVisitors) {
    const nodes = this.getNodesAt(position, visitors);
    for (let x = 0; x < visitors.length; x += 1) {
      const typeName = visitors[x];
      for (let y = 0; y < nodes.length; y += 1) {
        const node = nodes[y];
        if (node.type === typeName) {
          return node;
        }
      }
    }
    return null;
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
   * 获取最近的注释
   * @param position
   */
  public getCommentsBefore(node: astTypes.ASTNode) {
    if (!node) return [];
    const offset = node.range[0];
    const tokenIndex = this.tokens.findIndex((t) => {
      const [start, end] = t.range ?? [0, 0];
      return offset >= start && offset <= end;
    });

    let comments = '';
    for (let i = tokenIndex - 1; i >= 0; i -= 1) {
      const token = this.tokens[i];
      if (token.type !== 'Keyword') {
        break;
      } else if (token.value.startsWith('//')) {
        comments += token.value.substring(2).trim();
        comments += '\n';
      } else if (token.value.startsWith('/*') && token.value.endsWith('*/')) {
        // TODO: parse JSDoc like comments
        comments += token.value.trim();
        comments += '\n';
      } else {
        break;
      }
    }
    return comments;
  }

  /**
   * 从当前文件 resolve 相对路径
   * @param relativePath string 相对当前文件的路径
   * @todo 支持 `node_modules` 等包管理
   */
  public resolveUri(relativePath: string) {
    const currentDirname = vscodeUri.Utils.dirname(this.parsedUri);
    const targetUri = vscodeUri.Utils.resolvePath(currentDirname, relativePath);
    return targetUri;
  }

  // /**
  //  * Get contract definition node by position offset
  //  * @param offset position offset
  //  * @returns contract definition node
  //  */
  // public getContractByOffset(offset: number): astTypes.ContractDefinition | undefined {
  //   const contractNode = this.contracts.find((contract) => {
  //     return contract.range![0] <= offset && offset <= contract.range![1];
  //   });
  //   return contractNode;
  // }

  // public offsetToPositionRange(start: number, end: number): Range {
  //   return Range.create(this.positionAt(start), this.positionAt(end));
  // }

  // /**
  //  * Visit current document's AST
  //  * @param visitor
  //  * @param nodeParent
  //  */
  // public visit(visitor: astTypes.ASTVisitor, nodeParent?: astTypes.ASTNode) {
  //   parser.visit(this.ast, visitor, nodeParent);
  // }
}
