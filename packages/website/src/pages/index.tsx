import React from 'react';
import { ConfigProvider } from 'antd';
import { IDEWorkbench, RemaxBuiltinExtensionModule } from '@remax-ide/core';
import { workspace } from './workspace';
import { RemaxModule } from './module';
import { extensions } from './extensions';

export const WorkbenchPage: React.FC<unknown> = () => {
  return (
    <ConfigProvider prefixCls="sumi_antd">
      <IDEWorkbench
        style={{ height: '100vh' }}
        appConfig={{}}
        modules={[RemaxBuiltinExtensionModule, RemaxModule]}
        workspace={workspace}
        extensions={extensions}
      />
    </ConfigProvider>
  );
};
WorkbenchPage.displayName = 'WorkbenchPage';

export default WorkbenchPage;
