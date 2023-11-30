import React from 'react';
import { IDEWorkbench, RemaxBuiltinExtensionModule } from '@remax-ide/core';
import { ExtensionIdentity } from '@remax-ide/common';
import { workspace } from './workspace';
import { RemaxModule } from './module';

// const extensionsBaseUri = 'localhost:3001/marketplace/extensions';
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
  uri: `${window.location.origin}/resources/@remax-ide/marketplace/extensions/${item.publisher}/${item.name}/${item.version}/extension/`,
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
      modules={[RemaxBuiltinExtensionModule, RemaxModule]}
      workspace={workspace}
      extensions={[
        ...extensions,
        {
          uri: `${window.location.origin}/resources/@remax-ide/extension-formatter/`,
          // uri: 'http://localhost:3001/extension-formatter/',
          nlsFilename: 'package.nls.json',
        },
        {
          uri: `${window.location.origin}/resources/@remax-ide/extension-language-compiler/`,
          // uri: 'http://localhost:3001/extension-language-compiler/',
          nlsFilename: 'package.nls.json',
        },
        {
          uri: `${window.location.origin}/resources/@remax-ide/extension-language-server/`,
          // uri: 'http://localhost:3001/extension-language-server/',
          nlsFilename: 'package.nls.json',
        },
      ]}
    />
  );
};
