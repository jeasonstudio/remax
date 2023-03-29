import { astTypes } from './parser';

/**
 * AST Node to Signature String
 * @param node ast node
 * @returns string
 */
export const nodeToString = (node: astTypes.ASTNode | null): string => {
  if (!node) {
    return '';
  }
  switch (node.type) {
    case 'PragmaDirective':
      return `pragma ${node.name} ${node.value}`;
    case 'VariableDeclaration':
      const typeName = nodeToString(node.typeName);
      return `${typeName}${node.visibility ? ` ${node.visibility}` : ''}${node?.name ? ` ${node.name}` : ''}`;
    case 'FunctionDefinition':
      const paramsString = node.parameters.map(nodeToString).join(', ');
      const returnString = node.returnParameters?.length ? node.returnParameters.map(nodeToString).join(', ') : 'void';
      return `${node.name || 'anonymous'}(${paramsString}) returns (${returnString})`;
    case 'ImportDirective':
      return `import '${node.path}'`;
    case 'ContractDefinition':
      return `${node.kind} ${node.name} {...}`;
    case 'Mapping':
      return `mapping(${nodeToString(node.keyType)} => ${nodeToString(node.valueType)})`;
    default:
      const name = (node as any)?.name;
      if (!name) {
        console.log('not_implemented', node);
      }
      return name || `not_implemented(${node.type})`;
  }
};
