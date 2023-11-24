import { Injectable, Autowired } from '@opensumi/di';
import { IExtensionBasicMetadata, IExtensionIdentity } from '@codeblitzjs/ide-common';
import {
  IExtensionNodeClientService,
  ExtensionNodeServiceServerPath,
  ICreateProcessOptions,
  IExtensionMetaData,
  IExtraMetaData,
} from '@opensumi/ide-extension';
import { Uri, UriUtils } from '@opensumi/ide-core-browser';
import { REMAX_EXTENSION_SCHEME } from '@remax-ide/common';
import { IFileServiceClient } from '@opensumi/ide-file-service';

const baseUri = Uri.from({ scheme: REMAX_EXTENSION_SCHEME, path: '/' });
const manifest = [
  {
    publisher: 'opensumi',
    name: 'anycode',
    version: '0.0.67',
  },
  {
    publisher: 'opensumi',
    name: 'anycode-cpp',
    version: '0.0.5',
  },
  {
    publisher: 'opensumi',
    name: 'anycode-typescript',
    version: '0.0.5',
  },
  {
    publisher: 'opensumi',
    name: 'emmet',
    version: '1.0.0',
  },
  {
    publisher: 'opensumi',
    name: 'html-language-features-worker',
    version: '1.53.0-patch.3',
  },
  {
    publisher: 'opensumi',
    name: 'ide-ext-theme',
    version: '2.5.1',
  },
  {
    publisher: 'opensumi',
    name: 'vsicons-slim',
    version: '1.0.5',
  },
  {
    publisher: 'opensumi',
    name: 'image-preview',
    version: '1.53.0-patch.1',
  },
  {
    publisher: 'opensumi',
    name: 'json-language-features-worker',
    version: '1.53.0-patch.3',
  },
  {
    publisher: 'opensumi',
    name: 'markdown-language-features-worker',
    version: '1.53.0-patch.2',
  },
  {
    publisher: 'opensumi',
    name: 'merge-conflict',
    version: '1.0.0',
  },
  {
    publisher: 'opensumi',
    name: 'references-view',
    version: '1.0.0',
  },
  {
    publisher: 'opensumi',
    name: 'typescript-language-features-worker',
    version: '1.53.0-patch.faas.3',
  },
  {
    publisher: 'opensumi',
    name: 'vsicons-slim',
    version: '1.0.5',
  },
  {
    publisher: 'PKief',
    name: 'material-icon-theme',
    version: '4.32.0',
  },
  {
    publisher: 'GitHub',
    name: 'github-vscode-theme',
    version: '6.3.4',
  },
];
// const endpointUri = Uri.parse('https://cdn.jsdelivr.net/npm/@remax-ide/marketplace/extensions');

@Injectable()
export class RemaxExtensionClientService implements IExtensionNodeClientService {
  @Autowired(IFileServiceClient)
  protected readonly fileServiceClient: IFileServiceClient;

  private getContentByUri = async (uri: Uri) => {
    const { content } = await this.fileServiceClient.readFile(uri.toString(true));
    return new TextDecoder().decode(content.buffer);
  };

  private getJsonByUri = async (uri: Uri) => {
    try {
      const content = await this.getContentByUri(uri);
      return JSON.parse(content);
    } catch (error) {
      return null;
    }
  };

  async getAllExtensions(
    _scan: string[],
    _extensionCandidate: string[],
    localization: string,
    extraMetadata: IExtraMetaData,
  ): Promise<IExtensionMetaData[]> {
    const result = await Promise.all<IExtensionMetaData>(
      manifest.map(async (identity) => {
        const extensionUri = UriUtils.joinPath(
          baseUri,
          identity.publisher,
          identity.name,
          identity.version,
          'extension',
        );
        const extensionId = `${identity.publisher}.${identity.name}`;
        const [packageJSON, packageNLSJSON = {}, zhNLSJSON = packageNLSJSON] = await Promise.all([
          this.getJsonByUri(UriUtils.joinPath(extensionUri, 'package.json')),
          this.getJsonByUri(UriUtils.joinPath(extensionUri, 'package.nls.json')),
          this.getJsonByUri(UriUtils.joinPath(extensionUri, `package.nls.zh-CN.json`)),
        ]);

        const metadata: IExtensionMetaData = {
          id: extensionId,
          extensionId,
          packageJSON,
          uri: extensionUri,
          defaultPkgNlsJSON: packageNLSJSON,
          packageNlsJSON: zhNLSJSON,
          extraMetadata,
          path: extensionUri.fsPath,
          realPath: extensionUri.fsPath,
          extendConfig: {},
          isBuiltin: true,
          isDevelopment: false,
        };

        return metadata;
      }),
    );
    console.log(result);
    return result;
  }
  async getExtension(
    extensionPath: string,
    localization: string,
    extraMetaData?: IExtraMetaData | undefined,
  ): Promise<IExtensionMetaData | undefined> {
    throw new Error('not impl');
    return;
    // const extensionPath =
    //   ext.mode === 'local' && ext.uri
    //     ? ext.uri
    //     : getExtensionPath(ext.extension, ext.mode, OSSPath);
    // const extensionUri = Uri.parse(extensionPath);

    // let pkgNlsJSON: { [key: string]: string } | undefined;
    // if (localization.toLowerCase() === 'zh-cn') {
    //   pkgNlsJSON = ext.pkgNlsJSON['zh-CN'];
    // } else if (localization.toLowerCase() === 'en-us') {
    //   pkgNlsJSON = ext.pkgNlsJSON['en-US'];
    // } else {
    //   // 其它语言动态获取，估计基本用不到
    //   for (const { languageId, filename } of ext.nlsList) {
    //     const reg = new RegExp(
    //       `^${localization}|${localization.toLowerCase()}|${localization.split('-')[0]}$`,
    //     );
    //     if (reg.test(languageId)) {
    //       try {
    //         const res = await fetch(
    //           extensionUri.with({ scheme: 'https' }).toString() + '/' + filename,
    //         );
    //         if (res.status >= 200 && res.status < 300) {
    //           pkgNlsJSON = await res.json();
    //         }
    //       } catch (err) {}
    //       break;
    //     }
    //   }
    // }

    // const extraMetadata = await getExtraMetaData(
    //   ext.webAssets,
    //   extensionUri,
    //   localization,
    //   extraMetaData,
    // );

    // return {
    //   id: `${ext.packageJSON.publisher}.${ext.packageJSON.name}`,
    //   extensionId: `${ext.extension.publisher}.${ext.extension.name}`,
    //   packageJSON: ext.packageJSON,
    //   defaultPkgNlsJSON: ext.defaultPkgNlsJSON,
    //   packageNlsJSON: pkgNlsJSON,
    //   extraMetadata,
    //   path: extensionPath,
    //   realPath: extensionPath,
    //   extendConfig: ext.extendConfig,
    //   isBuiltin: true,
    //   isDevelopment: ext.mode === 'local',
    //   uri: extensionUri,
    // };
  }
  getElectronMainThreadListenPath(_clientId: string): Promise<string> {
    throw new Error(
      '`RemaxExtensionClientService.getElectronMainThreadListenPath` not implemented in browser.',
    );
  }
  createProcess(_clientId: string, _options: ICreateProcessOptions): Promise<void> {
    throw new Error('`RemaxExtensionClientService.createProcess` not implemented in browser.');
  }
  infoProcessNotExist(): void {
    throw new Error(
      '`RemaxExtensionClientService.infoProcessNotExist` not implemented in browser.',
    );
  }
  infoProcessCrash(): void {
    throw new Error('`RemaxExtensionClientService.infoProcessCrash` not implemented in browser.');
  }
  restartExtProcessByClient(): void {
    throw new Error(
      '`RemaxExtensionClientService.restartExtProcessByClient` not implemented in browser.',
    );
  }
  disposeClientExtProcess(_clientId: string, _info: boolean): Promise<void> {
    throw new Error(
      '`RemaxExtensionClientService.disposeClientExtProcess` not implemented in browser.',
    );
  }
  updateLanguagePack(
    _languageId: string,
    _languagePackPath: string,
    _storagePath: string,
  ): Promise<void> {
    throw new Error('`RemaxExtensionClientService.updateLanguagePack` not implemented in browser.');
  }
  getOpenVSXRegistry(): Promise<string> {
    throw new Error('`RemaxExtensionClientService.getOpenVSXRegistry` not implemented in browser.');
  }
}
