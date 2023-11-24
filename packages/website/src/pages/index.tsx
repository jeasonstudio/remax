import React from 'react';
import { IDEWorkbench, RemaxBuiltinExtensionModule } from '@remax-ide/core';

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
    />
  );
};
