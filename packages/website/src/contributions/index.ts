import { Provider, Injectable } from '@opensumi/di';
import { BrowserModule } from '@opensumi/ide-core-browser';

import { AppContribution } from './app/app.contribution';
import { LogoContribution } from './logo/logo.contribution';
import { ActionsContribution } from './actions/actions.contribution';
import { WorkspaceContribution } from './workspace/workspace.contribution';

@Injectable()
export class RemaxModule extends BrowserModule {
  providers: Provider[] = [
    AppContribution,
    LogoContribution,
    ActionsContribution,
    WorkspaceContribution,
  ];
}
