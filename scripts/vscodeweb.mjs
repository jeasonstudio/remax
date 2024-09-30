#!/usr/bin/env zx

import "zx/globals";
import decompress from "decompress";
import decompressTargz from "decompress-targz";
import Downloader from "nodejs-file-downloader";
const pkg = require("../package.json");

// Find vscode release version(commit hash) at:
// https://github.com/microsoft/vscode/releases
const downloadUrl = `https://update.code.visualstudio.com/commit:${pkg.vscodeweb.commit}/web-standalone/stable`;
const projectRoot = process.cwd();
const vscodewebRoot = path.join(projectRoot, ".vscodeweb");

// Re-create .vscodeweb root folder
await fs.rm(vscodewebRoot, { recursive: true, maxRetries: 3, force: true });
await fs.mkdirp(vscodewebRoot);

// Download vscode-web.tar.gz
console.log(
  `Downloading vscodeweb v${pkg.vscodeweb.version}(${pkg.vscodeweb.commit})...`,
);
console.log(`From: ${downloadUrl}`);
const targzFilename = `${pkg.vscodeweb.commit}.tar.gz`;
const downloader = new Downloader({
  url: downloadUrl,
  directory: vscodewebRoot,
  fileName: targzFilename,
});
const reporter = await downloader.download();
const targzPath = path.join(vscodewebRoot, targzFilename);
console.log(`Download vscodeweb ${reporter.downloadStatus} to ${targzPath}.`);

// Decompress vscode-web.tar.gz to .vscodeweb/{vscodeweb-commit}
const targetPath = path.join(vscodewebRoot, pkg.vscodeweb.commit);
const result = await decompress(targzPath, targetPath, {
  plugins: [decompressTargz()],
  strip: 1,
});
console.log(`Decompress vscodeweb ${result?.length ? "success" : "fail"}!`);
console.log("Done!");
