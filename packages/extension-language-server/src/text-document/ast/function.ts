import { astTypes } from '../../utils/parser';
import { ASTNode } from './base';

export class ASTFunction extends ASTNode<astTypes.FunctionDefinition> {
  public name: string;

  public constructor(ast: astTypes.FunctionDefinition) {
    super(ast);
    this.name = ast.name || '';
  }
}
