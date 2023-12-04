import { astTypes } from '../../utils/parser';

export abstract class ASTNode<T extends astTypes.BaseASTNode> {
  public range: [number, number] = [0, 0];

  public constructor(public readonly ast: T) {
    this.range = [ast.range?.[0] || 0, ast.range?.[1] || 0];
  }
  public includes(offset: number): boolean {
    return this.range[0] <= offset && offset <= this.range[1];
  }
}
