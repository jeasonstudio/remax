import { Connection, Hover, MarkupContent, MarkupKind, Range } from 'vscode-languageserver/browser';
import { Context } from '../context';
import { astTypes } from '../utils/parser';
import { node2string } from '../utils/node';
import { completions } from '../completion/globals';

type OnHover = Parameters<Connection['onHover']>[0];
type Node = astTypes.ASTNode & Record<string, any>;

export const onHover =
  (ctx: Context): OnHover =>
  async ({ textDocument, position }) => {
    const document = ctx.documents.get(textDocument.uri);
    if (!document) return null;

    const node = document.getNodeAt(position, [
      'ImportDirective',
      // 'StateVariableDeclaration',
      'VariableDeclaration',
      'Identifier',
    ]) as Node;

    // const comments = document.getCommentsBefore(node);

    const getRange = (n: Node): Range | undefined => ({
      start: document.positionAt(n.range?.[0] ?? 0),
      end: document.positionAt((n.range?.[1] ?? 0) + 1),
    });

    const getContent = (c: string[]): MarkupContent => ({
      kind: MarkupKind.Markdown,
      value: ['```solidity', ...c, '```'].join('\n'),
    });

    const getHover = (n: Node, c: string[]): Hover => ({
      range: getRange(n),
      contents: getContent(c),
    });

    const formatHover = (n: Node): Hover => {
      switch (n?.type) {
        case 'ImportDirective':
          n.path = document.resolveUri(n.path).fsPath;
          return getHover(n, [node2string(n)]);
        case 'VariableDeclaration':
          return getHover(n, [
            (n?.isStateVar ? '(state variable) ' : '(local variable) ') + node2string(n),
          ]);
        case 'Identifier':
          const globalCompletion = completions[n.name];
          if (globalCompletion) {
            return {
              range: getRange(n),
              contents: getContent([globalCompletion.detail]),
            };
          }
          const refNode: any = document.getIdentifierReferenceNode(n);
          if (refNode) {
            return getHover(n, [
              node2string(refNode),
              refNode?.isStateVar ? '(state variable)' : '(local variable)',
            ]);
          }
          return null;
        default:
          return null;
      }
    };

    console.log('onHover node', node);
    return formatHover(node);
  };
