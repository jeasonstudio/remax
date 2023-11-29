import { Autowired } from '@opensumi/di';
import { IMainLayoutService } from '@opensumi/ide-main-layout';
import {
  ClientAppContribution,
  Domain,
  IClientApp,
  MaybePromise,
} from '@opensumi/ide-core-browser';
import React from 'react';

export const Test = () => React.createElement('div', { id: 'aaaa' }, 'test');

@Domain(ClientAppContribution)
export class AppContribution implements ClientAppContribution {
  @Autowired(IMainLayoutService)
  private readonly layoutService: IMainLayoutService;

  initialize(app: IClientApp): MaybePromise<void> {
    console.log(11, this.layoutService);
    // 注册文件树到资源管理器容器内
  }
}
