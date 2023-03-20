const fs = require('fs');
const path = require('path');

const builtinExtensions = [
  // 'bat',
  'clojure',
  'coffeescript',
  'configuration-editing',
  'cpp',
  'csharp',
  'css',
  'css-language-features',
  'dart',
  'diff',
  'docker',
  'emmet',
  'extension-editing',
  'fsharp',
  'git-base',
  'github-authentication',
  'go',
  'groovy',
  'handlebars',
  'hlsl',
  'html',
  'html-language-features',
  'ini',
  'ipynb',
  'java',
  'javascript',
  'json',
  'json-language-features',
  'julia',
  'latex',
  'less',
  'log',
  'lua',
  'make',
  'markdown-basics',
  'markdown-language-features',
  'markdown-math',
  'media-preview',
  'merge-conflict',
  'microsoft-authentication',
  'ms-vscode-remote.remote-wsl-recommender',
  'notebook-renderers',
  'npm',
  'objective-c',
  'perl',
  'php',
  'powershell',
  'pug',
  'python',
  'r',
  'razor',
  'references-view',
  'restructuredtext',
  'ruby',
  'rust',
  'scss',
  'search-result',
  'shaderlab',
  'shellscript',
  'simple-browser',
  'sql',
  'swift',
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
  'vb',
  'xml',
  'yaml',
];

module.exports.builtinExtensions = builtinExtensions;

module.exports.getScannedBuiltinExtensions = async (extensionsRoot, extensionNameList) => {
  const scannedExtensions: IScannedBuiltinExtension[] = [];
  try {
    for (let index = 0; index < extensionNameList.length; index += 1) {
      const extensionFolder = extensionNameList[index];
      const packageJSONPath = path.join(extensionsRoot, extensionFolder, 'package.json');
      if (!fs.existsSync(packageJSONPath)) {
        console.log('Skipping extension', extensionFolder, 'because it is not installed.');
        continue;
      }
      const packageNLSPath = path.join(extensionsRoot, extensionFolder, 'package.nls.json');
      const packageNLS = packageNLSPath
        ? JSON.parse(fs.readFileSync(path.join(extensionsRoot, extensionFolder, packageNLSPath)).toString())
        : undefined;
      let browserNlsMetadataPath: string | undefined;
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
};

// export interface IScannedBuiltinExtension {
// 	extensionPath: string;
// 	packageJSON: any;
// 	packageNLS?: any;
// 	browserNlsMetadataPath?: string;
// 	readmePath?: string;
// 	changelogPath?: string;
// }

// export function scanBuiltinExtensions(extensionsRoot: string, exclude: string[] = []): IScannedBuiltinExtension[] {
//   const scannedExtensions: IScannedBuiltinExtension[] = [];

//   try {
//     const extensionsFolders = fs.readdirSync(extensionsRoot);
//     for (const extensionFolder of extensionsFolders) {
//       if (exclude.indexOf(extensionFolder) >= 0) {
//         continue;
//       }
//       const packageJSONPath = path.join(extensionsRoot, extensionFolder, 'package.json');
//       if (!fs.existsSync(packageJSONPath)) {
//         continue;
//       }
//       const packageJSON = JSON.parse(fs.readFileSync(packageJSONPath).toString('utf8'));
//       if (!isWebExtension(packageJSON)) {
//         continue;
//       }
//       const children = fs.readdirSync(path.join(extensionsRoot, extensionFolder));
//       const packageNLSPath = children.filter((child) => child === 'package.nls.json')[0];
//       const packageNLS = packageNLSPath
//         ? JSON.parse(fs.readFileSync(path.join(extensionsRoot, extensionFolder, packageNLSPath)).toString())
//         : undefined;
//       let browserNlsMetadataPath: string | undefined;
//       if (packageJSON.browser) {
//         const browserEntrypointFolderPath = path.join(extensionFolder, path.dirname(packageJSON.browser));
//         if (fs.existsSync(path.join(extensionsRoot, browserEntrypointFolderPath, 'nls.metadata.json'))) {
//           browserNlsMetadataPath = path.join(browserEntrypointFolderPath, 'nls.metadata.json');
//         }
//       }
//       const readme = children.filter((child) => /^readme(\.txt|\.md|)$/i.test(child))[0];
//       const changelog = children.filter((child) => /^changelog(\.txt|\.md|)$/i.test(child))[0];

//       scannedExtensions.push({
//         extensionPath: extensionFolder,
//         packageJSON,
//         packageNLS,
//         browserNlsMetadataPath,
//         readmePath: readme ? path.join(extensionFolder, readme) : undefined,
//         changelogPath: changelog ? path.join(extensionFolder, changelog) : undefined,
//       });
//     }
//     return scannedExtensions;
//   } catch (ex) {
//     return scannedExtensions;
//   }
// }
