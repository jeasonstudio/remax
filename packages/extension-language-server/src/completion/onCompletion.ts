import { createDebug } from '@remax-ide/common/debug';
import { Connection, Position, Range, CompletionItem } from 'vscode-languageserver/browser';
import { Context } from '../context';
import { CompletionTriggerKind } from 'vscode-languageserver/browser';
import { tokenize } from '../utils/parser';
import { globallyList } from '../globally';

const debug = createDebug('extension:language-server:onCompletion');

type OnCompletion = Parameters<Connection['onCompletion']>[0];

export const onCompletion =
  (ctx: Context): OnCompletion =>
  async ({ textDocument, position, context }) => {
    const document = ctx.documents.get(textDocument.uri);
    if (!document) return null;
    const preCalculatedLines = 2;

    const content = document.getText(
      Range.create(
        Position.create(
          position.line - preCalculatedLines < 0 ? 0 : position.line - preCalculatedLines,
          0,
        ),
        position,
      ),
    );
    const tokens = tokenize(content);

    if (!context.triggerCharacter && context.triggerKind === CompletionTriggerKind.Invoked) {
      const token = tokens[tokens.length - 1];
      const completions: CompletionItem[] = [];
      if (token?.type !== 'Identifier') return null;
      const trigger = token.value;

      const globallyMatchedItems = globallyList.filter((gi) => gi.detail.startsWith(trigger));
      completions.push(
        ...globallyMatchedItems.map((item) => ({
          label: item.label,
          kind: item.kind,
          detail: item.detail,
          documentation: item.documentation,
        })),
      );

      return completions;
    } else if (context.triggerCharacter === '.') {
      // context.triggerKind = CompletionTriggerKind.TriggerForIncompleteCompletions;
    }

    return null;
  };
