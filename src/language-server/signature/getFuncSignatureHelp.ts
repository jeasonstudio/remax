import { MarkupKind, SignatureInformation } from 'vscode-languageserver/browser';
import { astTypes, nodeToString, parserTypes, visit } from '../utils';

export const getFuncSignatureHelp = (
  token: parserTypes.Token,
  contracts?: Array<astTypes.ContractDefinition | undefined>,
): SignatureInformation[] => {
  const result: SignatureInformation[] = [];
  if (!contracts?.length) {
    return result;
  }
  for (let index = 0; index < contracts.length; index += 1) {
    const contract = contracts[index];
    if (!contract) {
      continue;
    }

    visit(contract, {
      FunctionDefinition: (n) => {
        if (n?.name && n.name === token.value) {
          result.push({
            label: n.name,
            documentation: {
              kind: MarkupKind.Markdown,
              value: ['```solidity', nodeToString(n), '```'].join('\n'),
            },
            // parameters: n.parameters.map((parameter) => ({
            //   // label: parameter.name!,
            //   // documentation: {
            //   //   kind: MarkupKind.Markdown,
            //   //   value: ['```solidity', nodeToString(parameter), '```'].join('\n'),
            //   // },
            // })),
          });
        }
      },
    });
  }
  return result;
};
