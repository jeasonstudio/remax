import { IRemaxMarketplaceService } from './common';
import { Injectable } from '@opensumi/di';
import { Uri, Event, UriUtils } from '@opensumi/ide-core-browser';
import {
  FileStat,
  FileChangeEvent,
  FileSystemProviderCapabilities,
} from '@opensumi/ide-file-service';

@Injectable()
export class JsDeliverMarketplaceServiceImpl implements IRemaxMarketplaceService {
  private readonly endpoint = Uri.parse(
    'https://cdn.jsdelivr.net/npm/@remax-ide/marketplace/extensions',
  );

  capabilities: FileSystemProviderCapabilities;
  readonly = true;

  onDidChangeCapabilities = Event.None;
  onDidChangeFile: Event<FileChangeEvent>;

  private notImplemented = () => {
    throw new Error('Method not implemented in `JsDeliverMarketplaceProvider`.');
  };

  watch = this.notImplemented;
  unwatch = this.notImplemented;
  readDirectory = this.notImplemented;
  createDirectory = this.notImplemented;
  writeFile = this.notImplemented;
  delete = this.notImplemented;
  rename = this.notImplemented;

  stat = async (uri: Uri): Promise<FileStat> => ({
    uri: uri.toString(true),
    lastModification: Date.now(),
    isDirectory: false,
  });

  readFile = async (uri: Uri, _encoding?: string | undefined): Promise<Uint8Array> => {
    const requestUri = UriUtils.joinPath(this.endpoint, uri.path);
    const response = await fetch(requestUri.toString(true), {
      headers: { 'Accept-Encoding': 'gzip, deflate' },
    });
    return new Uint8Array(await response.arrayBuffer());
  };
}
