// See this pull-request:
// https://github.com/solidity-parser/parser/pull/83
import type { PartialDeep } from 'type-fest';
import { matches as lodashMatches } from '@remax-ide/common/lodash';
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

export type ASTNodeFilter = PartialDeep<astTypes.ASTNode> & {
  parentFilter?: ASTNodeFilter;
};

export const matches =
  (_filter: ASTNodeFilter) => (node: astTypes.ASTNode, parent?: astTypes.ASTNode) => {
    const { parentFilter, ...filter } = _filter;
    if (!parentFilter || !parent) {
      return lodashMatches(filter)(node);
    }
    return lodashMatches(filter)(node) && matches(parentFilter)(parent);
  };

// /**
//  * 从 AST 中找出符合条件的节点
//  *
//  * @param node ast node
//  * @param filter
//  * @returns nodes
//  */
// export const astFilter = (node: astTypes.ASTNode, filter: ASTNodeFilter): astTypes.ASTNode[] => {
//   const targets: astTypes.ASTNode[] = [];
//   const filterVisitor = (currentNode: astTypes.ASTNode, parentNode?: astTypes.ASTNode) => {
//     const isParentMatch =
//       filter.parentFilter && parentNode ? matches(filter.parentFilter)(parentNode) : true;
//     const currentMatch = matches(filter)(currentNode);
//     if (currentMatch && isParentMatch) {
//       targets.push(currentNode);
//       console.log(parentNode);
//     }
//   };
//   const visitor = Object.fromEntries(exitVisitors.map((v) => [v, filterVisitor]));
//   visit(node, visitor);
//   return targets;
// };
