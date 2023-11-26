// self.importScripts(self.location.origin + '/extensions/remax/solidity-parser.js');
// export const parser: typeof import('@solidity-parser/parser') = self.SolidityParser;

// See this pull-request:
// https://github.com/solidity-parser/parser/pull/83
import * as sp from '@remax-ide/solidity-parser';
import type * as parserTypes from '@remax-ide/solidity-parser/dist/src/types';
import type * as astTypes from '@remax-ide/solidity-parser/dist/src/ast-types';
import { enterVisitors, exitVisitors } from './visitors';

export const parser = sp;

export const parse = parser.parse;

export const tokenize = (content: string): parserTypes.Token[] => {
  const tokens = sp.tokenize(content, { range: true, loc: true }) || [];
  return tokens;
};

export const visit = parser.visit;

export const visitEnter = (
  node: unknown,
  enter: (ast: astTypes.ASTNode, parent?: astTypes.ASTNode) => any,
) => {
  const visitor = Object.fromEntries(enterVisitors.map((v) => [v, enter]));
  return visit(node, visitor);
};

export const visitExit = (
  node: unknown,
  exit: (ast: astTypes.ASTNode, parent?: astTypes.ASTNode) => any,
) => {
  const visitor = Object.fromEntries(exitVisitors.map((v) => [v, exit]));
  return visit(node, visitor);
};

export { parserTypes, astTypes };

export type VisitorName = astTypes.ASTNodeTypeString;
