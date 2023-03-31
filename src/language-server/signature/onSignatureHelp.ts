import { SignatureHelpTriggerKind, Connection, SignatureHelp } from 'vscode-languageserver/browser';
import { Context } from '../context';
import { getFuncSignatureHelp } from './getFuncSignatureHelp';
import { getGlobalSignatureHelp } from './getGlobalSignatureHelp';
import { tokenize } from '../utils';

type OnSignatureHelp = Parameters<Connection['onSignatureHelp']>[0];

let cachedHelp: SignatureHelp | null = null;

export const onSignatureHelp =
  (ctx: Context): OnSignatureHelp =>
  async ({ context, textDocument, position }) => {
    console.log('on signature help:', context, textDocument, position);

    const uri = textDocument.uri;
    const document = ctx.documents.get(uri);

    if (!uri || !document) {
      return null;
    }

    const offset = document.offsetAt(position) ?? 0;
    const triggerKind = context?.triggerKind || SignatureHelpTriggerKind.TriggerCharacter;

    // Trigger by `(` or user invoked
    if (triggerKind === SignatureHelpTriggerKind.TriggerCharacter || triggerKind === SignatureHelpTriggerKind.Invoked) {
      const help: SignatureHelp = {
        signatures: [],
        activeSignature: undefined,
        // Do not support parameter level signature help currently
        // should be 0 or undefined
        activeParameter: undefined,
      };

      const triggerCharacter = context?.triggerCharacter || '.';

      // Line text before the trigger character(not including the trigger character)
      const lineTextBeforeTrigger = document.getText({
        start: { line: position.line, character: 0 },
        end: { line: position.line, character: position.character - triggerCharacter.length },
      });

      // Line text tokens
      const tokens = tokenize(lineTextBeforeTrigger);
      if (!tokens.length) {
        return help;
      }
      console.log('tokens:', tokens);
      const token = tokens[tokens.length - 1];

      const contract = document.getContractByOffset(offset);
      const ancestorContracts = ctx.getAncestorsContracts(uri, contract?.name);
      const contracts = [contract, ...ancestorContracts];

      help.signatures = [...getGlobalSignatureHelp(token), ...getFuncSignatureHelp(token, contracts)];
      cachedHelp = help;

      return help;
    } else if (triggerKind === SignatureHelpTriggerKind.ContentChange) {
      if (!context?.isRetrigger) {
        cachedHelp = null;
        return null;
      }
      const lineText = document.getText({
        start: { line: position.line, character: 0 },
        end: { line: position.line, character: position.character },
      });
      // Line text tokens
      const tokens = tokenize(lineText);
      if (!tokens.length) {
        cachedHelp = null;
        return null;
      }
      const isSignatureHelpEnd = tokens.some((token) => {
        return token.type === 'Punctuator' && (token.value === ')' || token.value === ';');
      });
      if (isSignatureHelpEnd) {
        cachedHelp = null;
        return null;
      }
      return cachedHelp;
    }

    // Otherwise return null
    cachedHelp = null;
    return null;
  };
