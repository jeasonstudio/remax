import { CompletionItemKind, MarkupKind, SignatureInformation } from 'vscode-languageserver/browser';
import { astTypes, nodeToString, parserTypes, visit } from '../utils';
import { completions } from '../completion/globals';

export const getGlobalSignatureHelp = (token: parserTypes.Token): SignatureInformation[] => {
  const globalFunc = Object.values(completions).filter((comp) => comp.kind === CompletionItemKind.Function);
  const targetCompletion = globalFunc.find((comp) => comp.label === token.value);

  if (!targetCompletion) {
    return [];
  }
  const targetSignatureHelp: SignatureInformation = {
    label: targetCompletion.label,
    documentation: {
      kind: MarkupKind.Markdown,
      value: [targetCompletion?.documentation ?? '', '```solidity', targetCompletion.detail, '```'].join('\n'),
    },
  };

  return [targetSignatureHelp];

  // for (let index = 0; index < contracts.length; index += 1) {
  //   const contract = contracts[index];
  //   if (!contract) {
  //     continue;
  //   }

  //   visit(contract, {
  //     FunctionDefinition: (n) => {
  //       if (n?.name && n.name === token.value) {
  //         result.push({
  //           label: n.name,
  //           documentation: {
  //             kind: MarkupKind.Markdown,
  //             value: ['```solidity', nodeToString(n), '```'].join('\n'),
  //           },
  //           // parameters: n.parameters.map((parameter) => ({
  //           //   // label: parameter.name!,
  //           //   // documentation: {
  //           //   //   kind: MarkupKind.Markdown,
  //           //   //   value: ['```solidity', nodeToString(parameter), '```'].join('\n'),
  //           //   // },
  //           // })),
  //         });
  //       }
  //     },
  //   });
  // }
  // return result;
};
