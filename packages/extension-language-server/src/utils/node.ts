import { astTypes } from './parser';

/**
 * AST Node to Signature String
 * @param node ast node
 * @returns string
 */
export const node2string = (node: astTypes.ASTNode | null): string => {
  if (!node) return '';
  switch (node.type) {
    case 'ImportDirective':
      return `import "${node.path}";`;
    case 'ElementaryTypeName':
      return node.name;
    case 'VariableDeclaration':
      const typeName = node2string(node.typeName);
      return [
        typeName,
        node.visibility,
        node.storageLocation,
        node.isIndexed ? 'indexed' : null,
        node.name,
      ]
        .filter(Boolean)
        .join(' ');
    case 'StateVariableDeclaration':
      return (node?.variables || []).map(node2string).join('\n');

    case 'PragmaDirective':
      return `pragma ${node.name} ${node.value}`;

    case 'ModifierInvocation':
      return node.arguments?.length
        ? `${node.name}(${node.arguments.map(node2string).join(', ')})`
        : node.name;
    case 'FunctionDefinition':
      const paramsString = node.parameters.map(node2string).join(', ');
      const returnString = node.returnParameters?.length
        ? node.returnParameters.map(node2string).join(', ')
        : 'void';
      const visibility = node.visibility || '';
      const stateMutability = node.stateMutability || '';
      const modifierString = !node.modifiers?.length
        ? ''
        : node.modifiers.map(node2string).join(' ');
      return `function ${
        node.name || ''
      }(${paramsString}) ${visibility} ${stateMutability} ${modifierString} returns (${returnString})`;

    case 'ContractDefinition':
      return `${node.kind} ${node.name} {...}`;
    case 'Mapping':
      return `mapping(${node2string(node.keyType)} => ${node2string(node.valueType)})`;
    default:
      const name = (node as any)?.name || (node as any)?.namePath;
      if (!name) {
        console.log('not_implemented', node);
      }
      return name || `not_implemented(${node.type})`;
  }
};
