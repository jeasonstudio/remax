self.importScripts(self.location.origin + '/extensions/remax/solidity-parser.js');

export const parser: typeof import('@solidity-parser/parser') = self.SolidityParser;
