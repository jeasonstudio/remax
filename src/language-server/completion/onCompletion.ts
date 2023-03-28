import { CompletionList, CompletionTriggerKind, Connection } from 'vscode-languageserver/browser';
import { Context } from '../context';
import { tokenize } from '../utils';
import { getContractCompletions } from './getContractCompletions';
import { completions, getGlobalCompletionsByKeyword, globalVariables } from './globals';

type OnCompletion = Parameters<Connection['onCompletion']>[0];

const emptyCompletion: CompletionList = { isIncomplete: true, items: [] };
let completionCache: CompletionList = { isIncomplete: true, items: [] };

export const onCompletion =
  (ctx: Context): OnCompletion =>
  async ({ textDocument, position, context }) => {
    const uri = textDocument.uri;
    const document = ctx.documents.get(uri);
    const solidity = ctx.documentMap.get(uri);

    if (!uri || !document || !document.getText || !solidity) {
      return emptyCompletion;
    }

    const offset = document.offsetAt(position) ?? 0;
    const triggerKind = context?.triggerKind || CompletionTriggerKind.TriggerCharacter;

    const doCharacterCompletion = (): ReturnType<OnCompletion> => {
      const completion: CompletionList = { isIncomplete: true, items: [] };
      const triggerCharacter = context?.triggerCharacter || '.';

      // Line text before the trigger character(not including the trigger character)
      const lineTextBeforeTrigger = document.getText({
        start: { line: position.line, character: 0 },
        end: { line: position.line, character: position.character - triggerCharacter.length },
      });

      // Line text tokens
      const tokens = tokenize(lineTextBeforeTrigger);
      if (!tokens.length) {
        return completion;
      }
      console.log('tokens:', tokens);
      const token = tokens[tokens.length - 1];

      switch (triggerCharacter) {
        // this. super. msg. tx.
        case '.':
          if (token.type === 'Identifier' && token.value === 'this') {
            // get this contract variables
            const contract = solidity.getContractByOffset(offset);
            const completions = getContractCompletions([contract]);
            completion.items.push(...completions);
          } else if (token.type === 'Identifier' && token.value === 'super') {
            // get father contract variables
            const contract = solidity.getContractByOffset(offset);
            const contracts = ctx.getAncestorsContracts(uri, contract!.name);
            const completions = getContractCompletions(contracts);
            completion.items.push(...completions);
          } else if (token.type === 'Identifier' && globalVariables.includes(token.value ?? '')) {
            const completions = getGlobalCompletionsByKeyword(token.value);
            completion.items.push(...completions);
          } else {
            // completion.items.push(...globalCompletions);
          }
          break;
        case ' ':
          // TODO: such as `emit Event();`
          break;
        case '/':
          break;
        case `"`:
        case `'`:
          break;
        case `*`:
          break;
        default:
          break;
      }
      completionCache = completion;
      return completion;
    };

    const doInvokedCompletion = (): ReturnType<OnCompletion> => {
      const lineText = document.getText({
        start: { line: position.line, character: 0 },
        end: { line: position.line, character: position.character },
      });
      const tokens = tokenize(lineText);
      if (!tokens.length) {
        return completionCache;
      }
      console.log('tokens:', tokens);
      const token = tokens[tokens.length - 1];

      const targetVariable = globalVariables.find((gv) => token?.value && gv.startsWith(token.value));

      if (token.type === 'Identifier' && targetVariable && completions[targetVariable]) {
        const completion = completions[targetVariable];
        completionCache.items = [completion];
      }

      return completionCache;
    };
    const doIncompleteCompletion = (): ReturnType<OnCompletion> => {
      return completionCache;
    };

    switch (triggerKind) {
      case CompletionTriggerKind.TriggerCharacter:
        return doCharacterCompletion();
      case CompletionTriggerKind.Invoked:
        return doInvokedCompletion();
      case CompletionTriggerKind.TriggerForIncompleteCompletions:
        return doIncompleteCompletion();
      default:
        ctx.console.error(new Error('Unknown triggerKind: ' + triggerKind));
    }
  };
