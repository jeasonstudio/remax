// self.importScripts(self.location.origin + '/extensions/remax/solidity-parser.js');
// export const parser: typeof import('@solidity-parser/parser') = self.SolidityParser;

// See this pull-request:
// https://github.com/solidity-parser/parser/pull/83
import * as sp from '@remax-ide/solidity-parser';
import type * as parserTypes from '@remax-ide/solidity-parser/dist/src/types';
import type * as astTypes from '@remax-ide/solidity-parser/dist/src/ast-types';

export const parser = sp;

export const parse = parser.parse;

export const tokenize = (content: string): parserTypes.Token[] => {
  const tokens = sp.tokenize(content, { range: true, loc: true }) || [];
  return tokens;
};

export const visit = parser.visit;

export { parserTypes, astTypes };
