import * as vscode from 'vscode';
import { GistFileSystemProvider } from './provider-gist';
import { MemoryFileSystemProvider } from './provider-memory';

const erc20 = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

// https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v3.0.0/contracts/token/ERC20/IERC20.sol
interface IERC20 {
    function totalSupply() external view returns (uint);

    function balanceOf(address account) external view returns (uint);

    function transfer(address recipient, uint amount) external returns (bool);

    function allowance(address owner, address spender) external view returns (uint);

    function approve(address spender, uint amount) external returns (bool);

    function transferFrom(address sender, address recipient, uint amount) external returns (bool);

    event Transfer(address indexed from, address indexed to, uint value);
    event Approval(address indexed owner, address indexed spender, uint value);
}

contract ERC20 is IERC20 {
    uint public totalSupply;
    mapping(address => uint) public balanceOf;
    mapping(address => mapping(address => uint)) public allowance;
    string public name = 'Solidity by Example';
    string public symbol = 'SOLBYEX';
    uint8 public decimals = 18;

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

    function transferFrom(address sender, address recipient, uint amount) external returns (bool) {
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

const encoder = new TextEncoder();

export function activate(context: vscode.ExtensionContext) {
  const memoryFS = new MemoryFileSystemProvider();
  const gistFS = new GistFileSystemProvider();
  context.subscriptions.push(
    vscode.workspace.registerFileSystemProvider('memfs', memoryFS, {
      isCaseSensitive: true,
      isReadonly: false,
    }),
  );
  context.subscriptions.push(
    vscode.workspace.registerFileSystemProvider('gist', gistFS, {
      isCaseSensitive: true,
      isReadonly: false,
    }),
  );

  memoryFS.createDirectory(vscode.Uri.parse('memfs:/test/'));
  memoryFS.writeFile(vscode.Uri.parse('memfs:/test/contract.sol'), encoder.encode(erc20), {
    create: true,
    overwrite: true,
  });
  memoryFS.writeFile(vscode.Uri.parse('memfs:/test/contract.md'), encoder.encode('hhh'), {
    create: true,
    overwrite: true,
  });
  memoryFS.writeFile(
    vscode.Uri.parse('memfs:/test.code-workspace'),
    encoder.encode(`{"folders":${JSON.stringify([vscode.Uri.parse('memfs:/test/')])}}`),
    {
      create: true,
      overwrite: true,
    },
  );
}

export function deactivate() {}
