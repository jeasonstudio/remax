import { ASTNode } from '../types';
import { parser } from './parser';
import { enterVisitors, definitionVisitors } from './visitors';

export const getDefinitionNodes = (ast: ASTNode, offset: number) => {
  const targetNodes: ASTNode[] = [];

  const visitDefinition = (n: ASTNode) => {
    const [start, end] = n.range ?? [0, 0];
    if (offset >= start && offset <= end) {
      targetNodes.push(n);
    }
  };
  const visitor = Object.fromEntries(definitionVisitors.map((v) => [v, visitDefinition]));
  parser.visit(ast, visitor);

  return targetNodes;
};

export const getNodeByOffset = (ast: ASTNode, offset: number): ASTNode | null => {
  let [start, end] = ast.range ?? [0, 0];
  let target: ASTNode | null = null;

  const visitDefinition = (n: ASTNode) => {
    const [s, e] = n.range ?? [0, 0];
    if (offset >= s && offset <= e) {
      start = s;
      end = e;
      target = n;
    }
  };

  const visitor = Object.fromEntries(enterVisitors.map((v) => [v, visitDefinition]));
  parser.visit(ast, visitor);

  return target;
};
