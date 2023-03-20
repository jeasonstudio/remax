#!/usr/bin/env zx

import 'zx/globals';
import Downloader from 'nodejs-file-downloader';
import decompress from 'decompress';
import decompressTargz from 'decompress-targz';
const pkg = require('../package.json');

// Find vscode release version(commit hash) at:
// https://github.com/microsoft/vscode/releases
const downloadUrl = `https://vscode.cdn.azure.cn/stable/${pkg.vscodeweb.commit}/vscode-web.tar.gz`;
const projectRoot = process.cwd();
const vscodewebRoot = path.join(projectRoot, '.vscodeweb');

// Re-create .vscodeweb root folder
await fs.rm(vscodewebRoot, { recursive: true, maxRetries: 3, force: true });
await fs.mkdirp(vscodewebRoot);

// Download vscode-web.tar.gz
console.log(`Downloading vscodeweb v${pkg.vscodeweb.version}(${pkg.vscodeweb.commit})...`);
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
console.log(`Decompress vscodeweb ${result?.length ? 'success' : 'fail'}!`);

// export interface IScannedBuiltinExtension {
// 	extensionPath: string;
// 	packageJSON: any;
// 	packageNLS?: any;
// 	browserNlsMetadataPath?: string;
// 	readmePath?: string;
// 	changelogPath?: string;
// }

async function getScannedBuiltinExtensions(extensionsRoot, extensionNameList) {
  const scannedExtensions = [];
  try {
    for (let index = 0; index < extensionNameList.length; index += 1) {
      const extensionFolder = extensionNameList[index];
      const packageJSONPath = path.join(extensionsRoot, extensionFolder, 'package.json');
      if (!fs.existsSync(packageJSONPath)) {
        console.log('Skipping extension', extensionFolder, 'because it is not installed.');
        continue;
      }
      const packageJSON = JSON.parse(fs.readFileSync(packageJSONPath).toString('utf8'));
      const children = fs.readdirSync(path.join(extensionsRoot, extensionFolder));
      const packageNLSPath = path.join(extensionsRoot, extensionFolder, 'package.nls.json');
      const packageNLS = fs.existsSync(packageNLSPath)
        ? JSON.parse(fs.readFileSync(packageNLSPath).toString())
        : undefined;
      let browserNlsMetadataPath = undefined;
      if (packageJSON.browser) {
        const browserEntrypointFolderPath = path.join(extensionFolder, path.dirname(packageJSON.browser));
        if (fs.existsSync(path.join(extensionsRoot, browserEntrypointFolderPath, 'nls.metadata.json'))) {
          browserNlsMetadataPath = path.join(browserEntrypointFolderPath, 'nls.metadata.json');
        }
      }
      const readme = children.filter((child) => /^readme(\.txt|\.md|)$/i.test(child))[0];
      const changelog = children.filter((child) => /^changelog(\.txt|\.md|)$/i.test(child))[0];

      scannedExtensions.push({
        extensionPath: extensionFolder,
        packageJSON,
        packageNLS,
        browserNlsMetadataPath,
        readmePath: readme ? path.join(extensionFolder, readme) : undefined,
        changelogPath: changelog ? path.join(extensionFolder, changelog) : undefined,
      });
    }
    return scannedExtensions;
  } catch (error) {
    console.error(error);
    return scannedExtensions;
  }
}

const builtinExtensions = [
  // 'bat',
  // 'clojure',
  'coffeescript',
  'configuration-editing',
  // 'cpp',
  // 'csharp',
  'css',
  'css-language-features',
  // 'dart',
  'diff',
  // 'docker',
  'emmet',
  'extension-editing',
  // 'fsharp',
  'git-base',
  // 'github-authentication',
  // 'go',
  // 'groovy',
  // 'handlebars',
  // 'hlsl',
  'html',
  'html-language-features',
  'ini',
  // 'ipynb',
  // 'java',
  'javascript',
  'json',
  'json-language-features',
  // 'julia',
  // 'latex',
  // 'less',
  'log',
  // 'lua',
  // 'make',
  'markdown-basics',
  'markdown-language-features',
  'markdown-math',
  'media-preview',
  'merge-conflict',
  // 'microsoft-authentication',
  // 'ms-vscode-remote.remote-wsl-recommender',
  'notebook-renderers',
  'npm',
  // 'objective-c',
  // 'perl',
  // 'php',
  // 'powershell',
  // 'pug',
  // 'python',
  // 'r',
  // 'razor',
  'references-view',
  // 'restructuredtext',
  // 'ruby',
  // 'rust',
  // 'scss',
  'search-result',
  // 'shaderlab',
  'shellscript',
  'simple-browser',
  // 'sql',
  // 'swift',
  'theme-abyss',
  'theme-defaults',
  'theme-kimbie-dark',
  'theme-monokai',
  'theme-monokai-dimmed',
  'theme-quietlight',
  'theme-red',
  'theme-seti',
  'theme-solarized-dark',
  'theme-solarized-light',
  'theme-tomorrow-night-blue',
  'typescript-basics',
  'typescript-language-features',
  // 'vb',
  'xml',
  'yaml',
];

const extensions = await getScannedBuiltinExtensions(path.join(targetPath, 'extensions'), builtinExtensions);
console.log('Loaded builtin-extensions count:', extensions.length);

const extensionMetadataPath = path.join(targetPath, 'builtin-extensions-metadata.json');
await fs.writeFile(extensionMetadataPath, JSON.stringify(extensions));

console.log('Builtin extensions metadata saved to:', extensionMetadataPath);
console.log('Done!');
