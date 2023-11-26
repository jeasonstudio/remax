import { CodeLens, Connection, Range } from 'vscode-languageserver/browser';
import { Context } from '../context';

type OnCodeLens = Parameters<Connection['onCodeLens']>[0];

export const onCodeLens =
  (ctx: Context): OnCodeLens =>
  async ({ textDocument }, token) => {
    const document = ctx.documents.get(textDocument.uri);
    if (!document || token.isCancellationRequested) return [];

    const codeLensList = document.contracts.map((contract): CodeLens => {
      const [start] = contract?.range ?? [0];
      const range = Range.create(document.positionAt(start), document.positionAt(start + 8));
      return {
        range,
        command: {
          title: 'Compile Contract',
          command: 'HelloOpenSumi',
          arguments: [],
        },
      };
    });
    console.log('codeLensList', codeLensList);

    return [];
  };
