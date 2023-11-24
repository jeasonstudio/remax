import { FileSystemConfiguration, RuntimeConfig } from '@codeblitzjs/ide-sumi-core';
import { createDebug } from '@remax-ide/common';

const debug = createDebug('workspace');

export const createWorkspace = (
  options: RuntimeConfig['workspace'] & { filesystem: FileSystemConfiguration },
) => ({
  onDidSaveTextDocument: (...argv) => debug('onDidSaveTextDocument', ...argv),
  onDidChangeTextDocument: (...argv) => debug('onDidChangeTextDocument', ...argv),
  onDidCreateFiles: (...argv) => debug('onDidCreateFiles', ...argv),
  onDidDeleteFiles: (...argv) => debug('onDidDeleteFiles', ...argv),
  onDidChangeFiles: (...argv) => debug('onDidChangeFiles', ...argv),
  ...options,
});

const ierc20 = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v3.0.0/contracts/token/ERC20/IERC20.sol
interface IERC20 {
    function totalSupply() external view returns (uint);

    function balanceOf(address account) external view returns (uint);

    function transfer(address recipient, uint amount) external returns (bool);

    function allowance(address owner, address spender) external view returns (uint);

    function approve(address spender, uint amount) external returns (bool);

    function transferFrom(
        address sender,
        address recipient,
        uint amount
    ) external returns (bool);

    event Transfer(address indexed from, address indexed to, uint value);
    event Approval(address indexed owner, address indexed spender, uint value);
}
`;

const erc20 = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./IERC20.sol";

contract ERC20 is IERC20 {
    uint public totalSupply;
    mapping(address => uint) public balanceOf;
    mapping(address => mapping(address => uint)) public allowance;
    string public name = "Solidity by Example";
    string public symbol = "SOLBYEX";
    uint8 public decimals = 18;

    /**
     * @dev Throws if called by any account other than the owner.
     * @param amount uint256
     * @param recipient address
     * @return bool
     */
    function transfer(address recipient, uint amount) external returns (bool) {
        balanceOf[msg.sender] -= amount;
        balanceOf[recipient] += amount;
        emit Transfer(msg.sender, recipient, amount);
        return true;
    }

    function approve(address spender, uint amount) external returns (bool) {
        allowance[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
        return true;
    }

    function transferFrom(
        address sender,
        address recipient,
        uint amount
    ) external returns (bool) {
        allowance[sender][msg.sender] -= amount;
        balanceOf[sender] -= amount;
        balanceOf[recipient] += amount;
        emit Transfer(sender, recipient, amount);
        return true;
    }

    function mint(uint amount) external {
        balanceOf[msg.sender] += amount;
        totalSupply += amount;
        emit Transfer(address(0), msg.sender, amount);
    }

    function burn(uint amount) external {
        balanceOf[msg.sender] -= amount;
        totalSupply -= amount;
        emit Transfer(msg.sender, address(0), amount);
    }
}
`;

export const defaultWorkspace = createWorkspace({
  filesystem: {
    fs: 'FileIndexSystem',
    options: {
      requestFileIndex: async () => ({
        'README.md': '这是一个默认的工作空间\n',
        'package.json': '{ "name": "playground" }\n',
        src: {
          'index.html': '<h1>欢迎使用 Smart Contract IDE</h1>\n',
          'main.js': "console.log('hhh');\n",
          'main.ts': "export const foo: string = 'hhh';\n",
          'main.cpp': '#include <iostream>\n',
        },
        contracts: {
          'IERC20.sol': ierc20,
          'ERC20.sol': erc20,
          // 'MyToken.sol': mytoken,
        },
      }),
    },
  },
});

export const dbWorkspace = createWorkspace({
  filesystem: {
    fs: 'IndexedDB',
    options: {
      storeName: 'remax_fs', // indexedDB store name，可选
    },
  },
});
