export const RemaxConfig = Symbol('RemaxConfig');

export interface ExtensionIdentity {
  uri: string;
  nlsFilename?: string;
  zhCnNlsFilename?: string;
  enUsNlsFilename?: string;
}

// eslint-disable-next-line @typescript-eslint/no-redeclare
export interface RemaxConfig {
  extensions?: ExtensionIdentity[];
}

export * from '@opensumi/ide-core-common';
