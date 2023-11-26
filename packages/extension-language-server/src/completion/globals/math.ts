import { CompletionItem, CompletionItemKind } from 'vscode-languageserver/browser';

// mapping(keyword => keyword[])
export const keywords: Record<string, string[]> = {
  addmod: [],
  mulmod: [],
  keccak256: [],
  sha256: [],
  ripemd160: [],
  ecrecover: [],
};
// mapping(keyword => completion)
export const completions: Record<string, CompletionItem> = {
  addmod: {
    label: 'addmod',
    kind: CompletionItemKind.Function,
    detail: 'addmod(uint x, uint y, uint k) returns (uint)',
    documentation:
      'compute (x + y) % k where the addition is performed with arbitrary precision and does not wrap around at 2**256. Assert that k != 0 starting from version 0.5.0.',
  },
  mulmod: {
    label: 'mulmod',
    kind: CompletionItemKind.Function,
    detail: 'mulmod(uint x, uint y, uint k) returns (uint)',
    documentation:
      'compute (x * y) % k where the multiplication is performed with arbitrary precision and does not wrap around at 2**256. Assert that k != 0 starting from version 0.5.0.',
  },
  keccak256: {
    label: 'keccak256',
    kind: CompletionItemKind.Function,
    detail: 'keccak256(bytes memory) returns (bytes32)',
    documentation: 'compute the Keccak-256 hash of the input',
  },
  sha256: {
    label: 'sha256',
    kind: CompletionItemKind.Function,
    detail: 'sha256(bytes memory) returns (bytes32)',
    documentation: 'compute the SHA-256 hash of the input',
  },
  ripemd160: {
    label: 'ripemd160',
    kind: CompletionItemKind.Function,
    detail: 'ripemd160(bytes memory) returns (bytes20)',
    documentation: 'compute the RIPEMD-160 hash of the input',
  },
  ecrecover: {
    label: 'ecrecover',
    kind: CompletionItemKind.Function,
    detail: 'ecrecover(bytes32 hash, uint8 v, bytes32 r, bytes32 s) returns (address)',
    documentation:
      'recover the address associated with the public key from elliptic curve signature or return zero on error',
  },
};
