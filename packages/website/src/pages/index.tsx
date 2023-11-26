import React from 'react';
import { IDEWorkbench, RemaxBuiltinExtensionModule } from '@remax-ide/core';
import { ExtensionIdentity, Uri } from '@remax-ide/common';

const extensionsBaseUri = 'g.alipay.com/@remax-ide/marketplace/extensions';
// const extensionsBaseUri = 'cdn.jsdelivr.net/npm/@remax-ide/marketplace/extensions';

const extensions: ExtensionIdentity[] = [
  {
    publisher: 'opensumi',
    name: 'anycode',
    version: '0.0.67',
    // uri: `${extensionsBaseUri}/opensumi/anycode/0.0.67/extension/`,
    // nlsUri: `${extensionsBaseUri}/opensumi/anycode/0.0.67/extension/package.nls.json`,
  },
  {
    publisher: 'opensumi',
    name: 'anycode-cpp',
    version: '0.0.5',
  },
  {
    publisher: 'opensumi',
    name: 'anycode-typescript',
    version: '0.0.5',
  },
  {
    publisher: 'opensumi',
    name: 'emmet',
    version: '1.0.0',
  },
  {
    publisher: 'opensumi',
    name: 'html-language-features-worker',
    version: '1.53.0-patch.3',
  },
  {
    publisher: 'opensumi',
    name: 'ide-ext-theme',
    version: '2.5.1',
  },
  {
    publisher: 'opensumi',
    name: 'vsicons-slim',
    version: '1.0.5',
  },
  {
    publisher: 'opensumi',
    name: 'image-preview',
    version: '1.53.0-patch.1',
  },
  {
    publisher: 'opensumi',
    name: 'json-language-features-worker',
    version: '1.53.0-patch.3',
  },
  {
    publisher: 'opensumi',
    name: 'markdown-language-features-worker',
    version: '1.53.0-patch.2',
  },
  {
    publisher: 'opensumi',
    name: 'merge-conflict',
    version: '1.0.0',
  },
  {
    publisher: 'opensumi',
    name: 'references-view',
    version: '1.0.0',
  },
  {
    publisher: 'opensumi',
    name: 'typescript-language-features-worker',
    version: '1.53.0-patch.faas.3',
  },
  {
    publisher: 'opensumi',
    name: 'vsicons-slim',
    version: '1.0.5',
  },
  {
    publisher: 'PKief',
    name: 'material-icon-theme',
    version: '4.32.0',
  },
  {
    publisher: 'GitHub',
    name: 'github-vscode-theme',
    version: '6.3.4',
  },
].map((item) => ({
  uri: Uri.from({
    scheme: 'https',
    path: `${extensionsBaseUri}/${item.publisher}/${item.name}/${item.version}/extension/`,
  }).toString(true),
  nlsFilename: 'package.nls.json',
}));

export default () => {
  return (
    <IDEWorkbench
      style={{ height: '100vh' }}
      appConfig={
        {
          // extensionOSSPath: `${window.location.origin}${
          //   (window as any).publicPath || '/'
          // }resources/extensions/`,
          // extensionMetadata: [],
        }
      }
      modules={[RemaxBuiltinExtensionModule]}
      extensions={[
        ...extensions,
        {
          uri: 'http://localhost:3000/packages/extension-language-compiler/',
          nlsFilename: 'package.nls.json',
        },
        {
          uri: 'http://localhost:3000/packages/extension-language-server/',
          nlsFilename: 'package.nls.json',
        },
        {
          uri: 'http://localhost:3000/packages/extension-formatter/',
          nlsFilename: 'package.nls.json',
        },
      ]}
    />
  );
};
