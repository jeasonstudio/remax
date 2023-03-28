#!/usr/bin/env zx

import 'zx/globals';
const pkg = require('../package.json');

$`git clone --depth=1 --branch=${pkg.vscodeweb.version} https://github.com/microsoft/vscode.git node_modules/vscodesource`;
