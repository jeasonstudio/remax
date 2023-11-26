import { Injectable, Autowired } from '@opensumi/di';
import {
  IExtensionNodeClientService,
  ICreateProcessOptions,
  IExtensionMetaData,
  IExtraMetaData,
} from '@opensumi/ide-extension';
import { Uri, UriUtils } from '@opensumi/ide-core-browser';
import { REMAX_EXTENSION_SCHEME, RemaxConfig } from '@remax-ide/common';
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
].map((identity) => ({
  ...identity,
  uri: UriUtils.joinPath(baseUri, identity.publisher, identity.name, identity.version, 'extension'),
}));
// const endpointUri = Uri.parse('https://cdn.jsdelivr.net/npm/@remax-ide/marketplace/extensions');

@Injectable()
export class RemaxExtensionClientService implements IExtensionNodeClientService {
  @Autowired(IFileServiceClient)
  protected readonly fileServiceClient: IFileServiceClient;

  @Autowired(RemaxConfig)
  protected readonly remaxConfig: RemaxConfig;

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
    const extensions = this.remaxConfig.extensions || [];

    const result = await Promise.all<IExtensionMetaData>(
      extensions.map(async (identity) => {
        const extensionUri = Uri.parse(identity.uri);
        const packageJsonUri = UriUtils.joinPath(extensionUri, 'package.json');
        let packageNlsUri: Uri | null = null;

        if (!identity.nlsFilename && !identity.zhCnNlsFilename && !identity.enUsNlsFilename) {
          // ignore
        } else if (localization.toLowerCase() === 'zh-cn') {
          packageNlsUri = UriUtils.joinPath(
            extensionUri,
            identity.zhCnNlsFilename || identity.nlsFilename || '',
          );
        } else {
          packageNlsUri = UriUtils.joinPath(
            extensionUri,
            identity.enUsNlsFilename || identity.nlsFilename || '',
          );
        }

        const [packageJson, packageNls = {}] = await Promise.all([
          this.getJsonByUri(packageJsonUri),
          packageNlsUri ? this.getJsonByUri(packageNlsUri) : null,
        ]);

        const extensionId = `${packageJson.publisher}.${packageJson.name}`;
        const metadata: IExtensionMetaData = {
          id: extensionId,
          extensionId,
          packageJSON: packageJson,
          uri: extensionUri,
          defaultPkgNlsJSON: packageNls,
          packageNlsJSON: packageNls,
          extraMetadata,
          path: extensionUri.toString(true),
          realPath: extensionUri.toString(true),
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
    _extensionPath: string,
    _localization: string,
    _extraMetaData?: IExtraMetaData | undefined,
  ): Promise<IExtensionMetaData | undefined> {
    throw new Error('not impl');
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
