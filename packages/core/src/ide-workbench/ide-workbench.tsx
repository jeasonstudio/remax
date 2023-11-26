import React from 'react';
import { Injector } from '@opensumi/di';
import { AppRenderer } from '@codeblitzjs/ide-core';
import { LayoutConfig } from '@opensumi/ide-core-browser';
import { IDEEmpty } from '../ide-empty';
import { IDEWelcome } from '../ide-welcome';
// import { defaultWorkspace } from '../workspaces';
import { IDEWorkbenchProps, IDEWorkbenchRef } from './types';
import { defaultWorkspace, dbWorkspace } from './workspace';
import './ide-workbench.less';
import { RemaxConfig } from '@remax-ide/common';

const debug = require('debug')('remax:ide-workbench');

const layoutConfig: LayoutConfig = {
  top: {
    modules: ['@opensumi/ide-menu-bar' /*, 'toolbar'*/],
  },
  action: {
    modules: [
      /*'@opensumi/ide-toolbar-action'*/
    ],
  },
  left: {
    modules: [
      '@opensumi/ide-explorer',
      '@opensumi/ide-search',
      // '@opensumi/ide-debug',
      // '@opensumi/ide-scm',
      // '@opensumi/ide-extension-manager',
    ],
  },
  main: {
    modules: ['@opensumi/ide-editor'],
  },
  bottom: {
    modules: ['@opensumi/ide-output', '@opensumi/ide-markers' /*, 'debug-console'*/],
  },
  statusBar: {
    modules: ['@opensumi/ide-status-bar'],
  },
  extra: {
    modules: ['breadcrumb-menu'],
  },
};

export const IDEWorkbench = React.forwardRef<IDEWorkbenchRef, IDEWorkbenchProps>((props, ref) => {
  const injectorRef = React.useRef<Injector>(
    new Injector([
      {
        token: RemaxConfig,
        useValue: { extensions: props.extensions ?? [] },
      },
    ]),
  );
  const appRef = React.useRef<IDEWorkbenchRef>();
  React.useImperativeHandle(ref, () => appRef.current, []);

  return (
    <div
      id={props.id}
      className={props.className}
      style={props.style}
      onClick={(event) => event.nativeEvent.stopImmediatePropagation()}
    >
      <AppRenderer
        onLoad={async (_app) => {
          debug('onLoad', _app);
          appRef.current = _app;

          // TODO: patch 下这个命令，否则会报错
          _app.commandRegistry.registerCommand(
            { id: 'codeService.getFileBlame' },
            { execute: () => {} },
          );

          console.log('==> modules', _app.browserModules);
          console.log('==> contributions', _app.contributions);

          await props.onLoad?.(_app);
        }}
        appConfig={{
          workspaceDir: 'playground/project1',
          layoutConfig,
          defaultPreferences: {
            'general.theme': 'github-light',
            'general.icon': 'material-icon-theme',
            'general.language': 'zh-CN',
            ...props.defaultPreferences,
          },
          plugins: [],
          modules: [...(props.modules ?? [])],
          injector: injectorRef.current,
          // extensionOSSPath: `${window.location.origin}/resources/extensions/`,
          // extWorkerHost: `${window.location.origin}/resources/server/worker-host.js`,

          // 私有化的资源文件，需要放到 /resources/ 下
          // useCdnIcon: false, // 见上
          // onigWasmUri: '', // onig wasm 文件
          // extensionBrowserStyleSheet: {
          //   componentUri: '', // 配置插件 browser 层的 component 样式文件
          //   iconfontUri: '', // 配置插件 browser 层的 iconfont 样式文件
          // },
          ...props.appConfig,
          storageDirName: '.remax',
          preferenceDirName: '.remax',
          workspacePreferenceDirName: '.remax',
          userPreferenceDirName: '.remax',
          extensionStorageDirName: '.remax',

          // extensionMetadata: [...extensions, ...(props.appConfig?.extensionMetadata ?? [])],
        }}
        runtimeConfig={{
          WelcomePage: IDEWelcome,
          EditorEmpty: IDEEmpty,
          workspace: dbWorkspace,
          scmFileTree: false,
          scenario: 'remax-ide',
          startupEditor: 'welcomePage',
        }}
      />
    </div>
  );
});
IDEWorkbench.displayName = 'IDEWorkbench';
IDEWorkbench.defaultProps = {};
