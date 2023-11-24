import { Provider, Injectable } from '@opensumi/di';
import { IExtensionNodeClientService } from '@opensumi/ide-extension';
import { BrowserModule, FsProviderContribution } from '@opensumi/ide-core-browser';
import { RemaxExtensionClientService } from './extension.service';
import { JsDeliverMarketplaceServiceImpl, IRemaxMarketplaceService } from './marketplaces';
import { RemaxExtensionFsProviderContribution } from './extension.contribution';
import { OpenSumiExtFsProvider } from '@codeblitzjs/ide-sumi-core';

@Injectable()
export class RemaxBuiltinExtensionModule extends BrowserModule {
  providers: Provider[] = [
    // {
    //   // This provider is overrideable
    //   // JsDeliver is the default impl
    //   token: IRemaxMarketplaceService,
    //   useClass: JsDeliverMarketplaceServiceImpl,
    //   override: true,
    // },
    RemaxExtensionFsProviderContribution,
    // {
    //   token: OpenSumiExtFsProvider,
    //   useClass: RemaxExtensionFsProviderContribution,
    //   override: true,
    // },
    {
      token: IExtensionNodeClientService,
      useClass: RemaxExtensionClientService,
      override: true,
    },
  ];
}
