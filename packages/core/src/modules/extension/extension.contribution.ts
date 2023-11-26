import {
  Domain,
  FsProviderContribution,
  Schemes,
  URI,
  Uri,
  UriUtils,
} from '@opensumi/ide-core-browser';
import { IFileServiceClient } from '@opensumi/ide-file-service';
import { REMAX_EXTENSION_SCHEME } from '@remax-ide/common';
import { StaticResourceContribution, StaticResourceService } from '@opensumi/ide-static-resource';
import { HttpFileSystemProvider } from './http.provider';

@Domain(StaticResourceContribution, FsProviderContribution)
export class RemaxExtensionFsProviderContribution
  implements StaticResourceContribution, FsProviderContribution
{
  private baseUri = Uri.from({
    scheme: Schemes.https,
    path: 'cdn.jsdelivr.net/npm/@remax-ide/marketplace/extensions',
    // path: 'unpkg.com/@remax-ide/marketplace@latest/extensions',
  });

  public registerStaticResolver(service: StaticResourceService): void {
    service.registerStaticResourceProvider({
      scheme: REMAX_EXTENSION_SCHEME,
      resolveStaticResource: (uri: URI) => {
        const target = UriUtils.joinPath(this.baseUri, uri.path.toString());
        return uri.withScheme(Schemes.https).withPath(target.path);
      },
    });
  }

  public registerProvider(registry: IFileServiceClient) {
    registry.registerProvider(REMAX_EXTENSION_SCHEME, new HttpFileSystemProvider(this.baseUri));
    (<any>registry).fsProviders.set(
      Schemes.http,
      new HttpFileSystemProvider(Uri.from({ scheme: Schemes.http })),
    );
    (<any>registry).fsProviders.set(
      Schemes.https,
      new HttpFileSystemProvider(Uri.from({ scheme: Schemes.https })),
    );
  }
}
