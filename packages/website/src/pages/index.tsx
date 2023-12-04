import React from 'react';
import { useLocation } from 'umi';
import { ConfigProvider } from 'antd';
import { IDEWorkbench, RemaxBuiltinExtensionModule } from '@remax-ide/core';
import { workspace as defaultWorkspace } from './workspace';
import { RemaxModule } from '../contributions';
import { extensions } from './extensions';
import { createWorkspace } from '@remax-ide/common';

import '@opensumi/antd-theme/lib/index.css';
import '../locales';

const useWorkspace = () => {
  const { pathname } = useLocation();
  if (!pathname.startsWith('/w/')) {
    return { workspaceDir: '.', workspace: defaultWorkspace, file: null };
  }

  const [, , workspaceDir, ..._files] = pathname.split('/');

  return {
    workspaceDir,
    workspace: createWorkspace({
      filesystem: {
        fs: 'IndexedDB',
        options: {
          storeName: `remax_ide/${workspaceDir}`,
        },
      },
    }),
    file: _files.join('/'),
  };
};

export const WorkbenchPage: React.FC<unknown> = () => {
  const { workspaceDir, workspace, file } = useWorkspace();

  return (
    <ConfigProvider prefixCls="sumi_antd">
      <IDEWorkbench
        style={{ height: '100vh' }}
        appConfig={{}}
        modules={[RemaxBuiltinExtensionModule, RemaxModule]}
        workspace={defaultWorkspace}
        workspaceDir="/"
        extensions={extensions}
      />
    </ConfigProvider>
  );
};
WorkbenchPage.displayName = 'WorkbenchPage';

export default WorkbenchPage;
