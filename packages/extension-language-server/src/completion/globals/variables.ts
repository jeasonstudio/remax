import { CompletionItem, CompletionItemKind } from 'vscode-languageserver/browser';

// mapping(keyword => keyword[])
export const keywords: Record<string, string[]> = {
  block: [
    'basefee',
    'chainid',
    'coinbase',
    'difficulty',
    'gaslimit',
    'number',
    'prevrandao',
    'timestamp',
  ],
  blockhash: [],
  gasleft: [],
  msg: ['data', 'sender', 'sig', 'value'],
  tx: ['gasprice', 'origin'],
  abi: [
    'decode',
    'encode',
    'encodePacked',
    'encodeWithSelector',
    'encodeWithSignature',
    'encodeCall',
  ],
};
// mapping(keyword => completion)
export const completions: Record<string, CompletionItem> = {
  blockhash: {
    label: 'blockhash',
    kind: CompletionItemKind.Function,
    detail: 'blockhash(uint blockNumber) returns (bytes32)',
    documentation:
      'hash of the given block when blocknumber is one of the 256 most recent blocks; otherwise returns zero',
  },
  gasleft: {
    label: 'gasleft',
    kind: CompletionItemKind.Function,
    detail: 'gasleft() returns (uint256)',
    documentation: 'remaining gas',
  },
  block: {
    label: 'block',
    kind: CompletionItemKind.Interface,
    detail: 'block',
    documentation: 'block information',
  },
  basefee: {
    label: 'basefee',
    kind: CompletionItemKind.Property,
    detail: 'uint',
    documentation: 'current block’s base fee (EIP-3198 and EIP-1559)',
  },
  chainid: {
    label: 'chainid',
    kind: CompletionItemKind.Property,
    detail: 'uint',
    documentation: 'current chain id',
  },
  coinbase: {
    label: 'coinbase',
    kind: CompletionItemKind.Property,
    detail: 'address payable',
    documentation: 'current block miner’s address',
  },
  difficulty: {
    label: 'difficulty',
    kind: CompletionItemKind.Property,
    detail: 'address payable',
    documentation:
      'current block difficulty (EVM < Paris). For other EVM versions it behaves as a deprecated alias for block.prevrandao (EIP-4399 )',
  },
  gaslimit: {
    label: 'gaslimit',
    kind: CompletionItemKind.Property,
    detail: 'uint',
    documentation: 'current block gaslimit',
  },
  number: {
    label: 'number',
    kind: CompletionItemKind.Property,
    detail: 'uint',
    documentation: 'current block number',
  },
  prevrandao: {
    label: 'prevrandao',
    kind: CompletionItemKind.Property,
    detail: 'uint',
    documentation: 'random number provided by the beacon chain (EVM >= Paris)',
  },
  timestamp: {
    label: 'timestamp',
    kind: CompletionItemKind.Property,
    detail: 'uint',
    documentation: 'current block timestamp as seconds since unix epoch',
  },
  msg: {
    label: 'msg',
    kind: CompletionItemKind.Interface,
    detail: 'msg',
    documentation: 'message information',
  },
  data: {
    label: 'data',
    kind: CompletionItemKind.Property,
    detail: 'bytes calldata',
    documentation: 'complete calldata',
  },
  sender: {
    label: 'sender',
    kind: CompletionItemKind.Property,
    detail: 'address',
    documentation: 'sender of the message (current call)',
  },
  sig: {
    label: 'sig',
    kind: CompletionItemKind.Property,
    detail: 'bytes4',
    documentation: 'first four bytes of the calldata (i.e. function identifier)',
  },
  value: {
    label: 'value',
    kind: CompletionItemKind.Property,
    detail: 'uint',
    documentation: 'number of wei sent with the message (1 Ether = 10^18 wei)',
  },
  tx: {
    label: 'tx',
    kind: CompletionItemKind.Interface,
    detail: 'tx',
    documentation: 'transaction information',
  },
  gasprice: {
    label: 'gasprice',
    kind: CompletionItemKind.Property,
    detail: 'uint',
    documentation: 'gas price of the transaction',
  },
  origin: {
    label: 'origin',
    kind: CompletionItemKind.Property,
    detail: 'address',
    documentation: 'sender of the transaction (full call chain)',
  },
  abi: {
    label: 'abi',
    kind: CompletionItemKind.Interface,
    detail: 'abi',
    documentation: 'abi',
  },
  decode: {
    label: 'decode',
    kind: CompletionItemKind.Function,
    detail: 'decode(bytes memory encodedData, (T1,T2,...,Tn) outputTypes) returns (T1,T2,...,Tn)',
    documentation: 'decode encodedData according to outputTypes',
  },
  encode: {
    label: 'encode',
    kind: CompletionItemKind.Function,
    detail: 'encode((T1,T2,...,Tn) inputTypes, T1 x1, T2 x2, ..., Tn xn) returns (bytes)',
    documentation: 'encode arguments according to inputTypes',
  },
  encodePacked: {
    label: 'encodePacked',
    kind: CompletionItemKind.Function,
    detail: 'encodePacked(T1 x1, T2 x2, ..., Tn xn) returns (bytes)',
    documentation: 'encode arguments tightly packed',
  },
  encodeWithSelector: {
    label: 'encodeWithSelector',
    kind: CompletionItemKind.Function,
    detail: 'encodeWithSelector(bytes4 selector, T1 x1, T2 x2, ..., Tn xn) returns (bytes)',
    documentation: 'encode arguments tightly packed with a selector',
  },
  encodeWithSignature: {
    label: 'encodeWithSignature',
    kind: CompletionItemKind.Function,
    detail: 'encodeWithSignature(string signature, T1 x1, T2 x2, ..., Tn xn) returns (bytes)',
    documentation: 'encode arguments tightly packed with a signature',
  },
  encodeCall: {
    label: 'encodeCall',
    kind: CompletionItemKind.Function,
    detail: 'encodeCall(function functionPointer, T1 x1, T2 x2, ..., Tn xn) returns (bytes)',
    documentation: 'encode arguments tightly packed with a function pointer',
  },
};
