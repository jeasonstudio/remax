import * as vscode from "vscode";
import {
  FILE_SYSTEM_DB_NAME,
  WORKBENCH_DEFAULT_PLAYGROUND_NAME,
} from "../../constants";
import { WrapperedIndexedDB } from "./indexed-db";
import { RemaxFileSystemProvider } from "./provider";

const readme = `# Welcome to Remax IDE Playground

Enjoy your coding with Remax IDE!
`;

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

export async function activate(context: vscode.ExtensionContext) {
  if (!WrapperedIndexedDB.isAvailable()) {
    // TODO: some toasts
  }
  const widb = new WrapperedIndexedDB();
  await widb.prepare();

  const remaxFileSystemProvider = new RemaxFileSystemProvider(widb);
  await remaxFileSystemProvider.prepare();

  console.log("Remax file system provider is ready.");

  // Register remax file system provider
  context.subscriptions.push(
    vscode.workspace.registerFileSystemProvider(
      RemaxFileSystemProvider.scheme,
      remaxFileSystemProvider,
      {
        isCaseSensitive: true,
        isReadonly: false,
      },
    ),
  );

  const playgroundUri = vscode.Uri.from({
    scheme: RemaxFileSystemProvider.scheme,
    path: "/" + WORKBENCH_DEFAULT_PLAYGROUND_NAME,
  });

  context.subscriptions.push(
    vscode.commands.registerCommand("remax.reset-playground", async () => {
      try {
        await remaxFileSystemProvider.delete(playgroundUri, {
          recursive: true,
        });
      } catch (error) {
        console.warn(error);
      }
      await remaxFileSystemProvider.createDirectory(playgroundUri);
      await remaxFileSystemProvider.writeFile(
        vscode.Uri.joinPath(playgroundUri, "erc20.sol"),
        encoder.encode(erc20),
        {
          create: true,
          overwrite: true,
        },
      );
      await remaxFileSystemProvider.writeFile(
        vscode.Uri.joinPath(playgroundUri, "README.md"),
        encoder.encode(readme),
        {
          create: true,
          overwrite: true,
        },
      );
    }),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("remax.open-playground", () =>
      vscode.commands.executeCommand("vscode.openFolder", playgroundUri),
    ),
  );
}

export async function deactivate() {}
