import { astTypes } from '../../utils/parser';
import { ASTNode } from './base';
import { ASTFunction } from './function';

export enum ASTContractKind {
  Contract = 'contract',
  Interface = 'interface',
  Library = 'library',
}

export class ASTContract extends ASTNode<astTypes.ContractDefinition> {
  // See: https://docs.soliditylang.org/en/v0.8.23/grammar.html#a4.SolidityParser.contractBodyElement
  public construct?: ASTFunction;
  public fallback?: ASTFunction;
  public receive?: ASTFunction;
  public functions: ASTFunction[] = [];
  public modifiers: astTypes.ModifierDefinition[] = [];
  public structs: astTypes.StructDefinition[] = [];
  public enums: astTypes.EnumDefinition[] = [];
  public userTypes: astTypes.UserDefinedTypeName[] = [];
  public stateVariables: astTypes.StateVariableDeclaration[] = [];
  public events: astTypes.EventDefinition[] = [];
  public errors: astTypes.CustomErrorDefinition[] = [];

  public name: string;
  public kind: ASTContractKind;

  public constructor(ast: astTypes.ContractDefinition) {
    super(ast);
    this.name = ast.name || 'unknown';
    this.kind = ast.kind as ASTContractKind;

    const nodes = ast.subNodes || [];
    for (let index = 0; index < nodes.length; index += 1) {
      const node = nodes[index];

      if (node.type === 'FunctionDefinition') {
        const current = node as astTypes.FunctionDefinition;
        if (current.isConstructor) {
          this.construct = new ASTFunction(current);
        } else if (current.isFallback) {
          this.fallback = new ASTFunction(current);
        } else if (current.isReceiveEther) {
          this.receive = new ASTFunction(current);
        } else {
          this.functions.push(new ASTFunction(current));
        }
      } else if (node.type === 'ModifierDefinition') {
        const current = node as astTypes.ModifierDefinition;
        this.modifiers.push(current);
      } else if (node.type === 'StructDefinition') {
        const current = node as astTypes.StructDefinition;
        this.structs.push(current);
      } else if (node.type === 'EnumDefinition') {
        const current = node as astTypes.EnumDefinition;
        this.enums.push(current);
      } else if (node.type === 'UserDefinedTypeName') {
        const current = node as astTypes.UserDefinedTypeName;
        this.userTypes.push(current);
      } else if (node.type === 'StateVariableDeclaration') {
        const current = node as astTypes.StateVariableDeclaration;
        this.stateVariables.push(current);
      } else if (node.type === 'EventDefinition') {
        const current = node as astTypes.EventDefinition;
        this.events.push(current);
      } else if (node.type === 'CustomErrorDefinition') {
        const current = node as astTypes.CustomErrorDefinition;
        this.errors.push(current);
      }
    }
  }
}
