import { Position } from 'vscode-languageserver/browser';
import { ASTNode } from '../types';

/**
 * AST visit by position
 * @deprecated
 * @param ast
 * @param position
 * @returns
 */
export const astVisitPosition = (ast: ASTNode, position: Position) => {
  const p = {
    // This comment copy from `hardhat-vscode` extension:
    // TO-DO: Remove +1 when "@solidity-parser" fix line counting.
    // Why +1? Because "vs-code" line counting from 0, and "@solidity-parser" from 1.
    line: position.line + 1,
    column: position.character,
  };

  const walker = (n: ASTNode): ASTNode | null => {
    if (n.loc!.start.line > p.line || n.loc!.end.line < p.line) {
      // Not in range
      return null;
    }
    if (
      // Just in range
      n.loc!.start.line === p.line &&
      n.loc!.end.line === p.line &&
      n.loc!.start.column >= p.column &&
      n.loc!.end.column <= p.column
    ) {
      return n;
    }

    let nList: ASTNode[];

    const nodeListKeys = [
      'children',
      'subNodes',
      'statements',
      'returnParameters',
      'parameters',
      'variables',
      'identifiers',
      'operations',
      'arguments',
      'names',
      'components',
    ];

    const key = nodeListKeys.find((k) => !!(n as any)?.[k]?.length);
    if ((n as any)?.body?.type) {
      nList = [(n as any).body];
    } else if (key) {
      nList = (n as any)[key];
    } else {
      nList = [];
    }

    for (let i = 0; i < nList.length; i += 1) {
      const child = nList[i];
      const target = walker(child);
      if (target) {
        return target;
      }
    }

    return n;
  };
  return walker(ast);
};
