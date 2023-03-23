import { URI } from 'vscode-uri';
import path from 'path-browserify';
import { RemaxWorkspaceProvider } from './workspace';
import { RemaxFileSystem } from '../file-system';
import { WORKBENCH_DEFAULT_PLAYGROUND_NAME } from '../constants';

const builtinExtensions = [
  // 'bat',
  // 'clojure',
  // 'coffeescript',
  'configuration-editing',
  // 'cpp',
  // 'csharp',
  // 'css',
  // 'css-language-features',
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
  // 'ini',
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
  // 'npm',
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

window.require(['vs/workbench/workbench.web.main'], async (workbench: any) => {
  (window as any).workbench = workbench;

  const workspaceProvider = await RemaxWorkspaceProvider.create(workbench);
  const vscodewebBuiltinExtensions: URI[] = builtinExtensions.map((extensionName) => {
    return URI.parse(`${window.location.origin}${process.env.BUILTIN_EXTENSIONS_BASE_URL}/${extensionName}`);
  });
  const remaxExtensions: URI[] = [URI.parse(`${window.location.origin}/extensions/remax`)];
  const additionalBuiltinExtensions: URI[] = [/*...vscodewebBuiltinExtensions,*/ ...remaxExtensions];

  const remaxfs = await RemaxFileSystem.init();
  (window as any).remaxfs = remaxfs;

  // const playgroundPath = path.join('/', WORKBENCH_DEFAULT_PLAYGROUND_NAME);
  // const isPlaygroundExists = await remaxfs.exists(playgroundPath);
  // if (!isPlaygroundExists) {
  //   await remaxfs.mkdir(playgroundPath);
  //   // await remaxfs.writeFile(path.join(playgroundPath, 'README.md'), Buffer.from('# Welcome to RemaxIDE!!'));
  // }

  // see: src/vs/workbench/browser/web.main.ts
  workbench.create(document.getElementById('workbench'), {
    settingsSyncOptions: {
      enabled: false, // TODO: disable settings sync for now
    },
    workspaceProvider,
    additionalBuiltinExtensions,
    welcomeBanner: {
      message: 'Welcome to Remax IDE!',
    },
    productConfiguration: {
      nameShort: 'Remax IDE',
      nameLong: 'Remax IDE',
      version: '1.76.2',
      date: '2023-03-19',
      portable: true,
      applicationName: 'remaxide',
      dataFolderName: '.remax-extensions',
      licenseName: 'MIT',
      licenseUrl: 'https://github.com/jeasonstudio/remax/blob/main/LICENSE',
      licenseFileName: 'LICENSE',
      reportIssueUrl: 'https://github.com/jeasonstudio/remax/issues/new',
      urlProtocol: 'remaxide',
      // webviewContentExternalBaseUrlTemplate:
      //   'https://{{uuid}}.vscode-cdn.net/insider/ef65ac1ba57f57f2a3961bfe94aa20481caca4c6/out/vs/workbench/contrib/webview/browser/pre/',
      builtInExtensions: [],
      webEndpointUrlTemplate: `${window.location.origin}/${process.env.VSCODE_WEB_COMMIT}`,
      // Set commit to falsy means environment is development
      // src/vs/workbench/services/environment/browser/environmentService.ts#45
      // commit: null,
    },
    configurationDefaults: {
      'workbench.colorTheme': 'Default Dark+ Experimental',
    },
  });
});
