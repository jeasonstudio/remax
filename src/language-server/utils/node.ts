import { ASTNode } from '../types';

/**
 * AST Node to Signature String
 * @param node ast node
 * @returns string
 */
export const nodeToString = (node: ASTNode | null): string => {
  if (!node) {
    return '';
  }
  switch (node.type) {
    case 'VariableDeclaration':
      const typeName = nodeToString(node.typeName);
      return `${typeName}${node?.name ? ` ${node.name}` : ''}`;
    case 'FunctionDefinition':
      const paramsString = node.parameters.map(nodeToString).join(', ');
      const returnString = node.returnParameters?.length ? node.returnParameters.map(nodeToString).join(', ') : 'void';
      return `${node.name || 'anonymous'}(${paramsString}) returns (${returnString})`;
    default:
      return (node as any)?.name || `not_implemented(${node.type})`;
  }
};
