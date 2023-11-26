import { Provider, Injectable } from '@opensumi/di';
import { IExtensionNodeClientService } from '@opensumi/ide-extension';
import { BrowserModule } from '@opensumi/ide-core-browser';
import { RemaxExtensionClientService } from './extension.service';
import { RemaxExtensionFsProviderContribution } from './extension.contribution';

@Injectable()
export class RemaxBuiltinExtensionModule extends BrowserModule {
  providers: Provider[] = [
    RemaxExtensionFsProviderContribution,
    {
      token: IExtensionNodeClientService,
      useClass: RemaxExtensionClientService,
      override: true,
    },
  ];
}
