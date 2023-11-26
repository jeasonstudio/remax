import { IAppConfig, IAppInstance } from '@codeblitzjs/ide-core';
import { RuntimeConfig } from '@codeblitzjs/ide-sumi-core';
import { ModuleConstructor } from '@opensumi/ide-core-browser';
import { ExtensionIdentity } from '@remax-ide/common';

export type IDEWorkbenchRef = IAppInstance | undefined;

export interface IDEWorkbenchProps {
  /**
   * dom id
   */
  id?: string;
  /**
   * dom class
   */
  className?: string;
  /**
   * dom style
   */
  style?: React.CSSProperties;
  /**
   * 加载完成回调
   */
  onLoad?: (app: IAppInstance) => void | Promise<void>;
  /**
   * 默认偏好设置
   */
  defaultPreferences?: Record<string, any>;
  /**
   * 工作空间设置
   */
  workspace?: RuntimeConfig['workspace'];

  /**
   * app config
   * fallback props
   */
  appConfig?: Partial<IAppConfig>;

  modules?: ModuleConstructor[];
  extensions?: ExtensionIdentity[];
}
