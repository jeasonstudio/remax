#!/usr/bin/env zx

import 'zx/globals';
const pkg = require('../package.json');

// Do not use
if (!fs.existsSync('vscode')) {
  await $`git clone --depth 1 --branch ${pkg.vscodeweb.version} https://github.com/microsoft/vscode.git`;
}
process.chdir('vscode');
