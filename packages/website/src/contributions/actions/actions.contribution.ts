import { Autowired } from '@opensumi/di';
import { IMainLayoutService } from '@opensumi/ide-main-layout';
import {
  ClientAppContribution,
  Domain,
  IClientApp,
  IToolbarRegistry,
  MaybePromise,
  ToolBarActionContribution,
} from '@opensumi/ide-core-browser';
import React from 'react';
import { IToolBarViewService, ToolBarContribution, ToolBarPosition } from '@opensumi/ide-toolbar';
import { Compile } from './compile';

export const Test = () => React.createElement('div', { id: 'aaaa' }, 'test');

@Domain(ToolBarActionContribution)
export class ActionsContribution implements ToolBarActionContribution {
  registerToolbarActions(registry: IToolbarRegistry) {
    console.log('toolbar locations:', registry.getAllLocations());
    // console.log('toolbar locations:', registry.getActionPosition());

    registry.registerToolbarActionGroup({
      id: 'remax_actions',
      preferredLocation: 'menu-right',
    });

    registry.registerToolbarAction({
      id: 'compile',
      description: 'compile',
      component: Compile,
      suggestSize: { height: 35, width: 100 },
      strictPosition: {
        group: 'remax_actions',
        location: 'menu-right',
      },
    });
  }
  registerToolBarElement(registry: IToolBarViewService) {
    console.log(registry.getVisibleElements(ToolBarPosition.LEFT));
    console.log(registry.getVisibleElements(ToolBarPosition.CENTER));
    console.log(registry.getVisibleElements(ToolBarPosition.RIGHT));
  }
}
