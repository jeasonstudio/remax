import { URI } from 'vscode-uri';

export type UriComponents = typeof URI;

// #region github://microsoft/vscode/src/vs/workbench/browser/web.api.ts
// copy from: @jeason

export interface IBaseWindowOpenable {
  label?: string;
}
export interface IWorkspaceToOpen extends IBaseWindowOpenable {
  readonly workspaceUri: any;
}
export interface IFolderToOpen extends IBaseWindowOpenable {
  readonly folderUri: any;
}
/**
 * A workspace to open in the workbench can either be:
 * - a workspace file with 0-N folders (via `workspaceUri`)
 * - a single folder (via `folderUri`)
 * - empty (via `undefined`)
 */
export type IWorkspace = IWorkspaceToOpen | IFolderToOpen | undefined;

export interface IWorkspaceProvider {
  /**
   * The initial workspace to open.
   */
  readonly workspace: IWorkspace;

  /**
   * Arbitrary payload from the `IWorkspaceProvider.open` call.
   */
  readonly payload?: object;

  /**
   * Return `true` if the provided [workspace](#IWorkspaceProvider.workspace) is trusted, `false` if not trusted, `undefined` if unknown.
   */
  readonly trusted?: boolean;

  /**
   * Asks to open a workspace in the current or a new window.
   *
   * @param workspace the workspace to open.
   * @param options optional options for the workspace to open.
   * - `reuse`: whether to open inside the current window or a new window
   * - `payload`: arbitrary payload that should be made available
   * to the opening window via the `IWorkspaceProvider.payload` property.
   * @param payload optional payload to send to the workspace to open.
   *
   * @returns true if successfully opened, false otherwise.
   */
  open(workspace: IWorkspace, options?: { reuse?: boolean; payload?: object }): Promise<boolean>;
}

// #endregion

interface IWorkspaceProviderParams extends Record<PropertyKey, any> {
  workspaceUri?: UriComponents;
  folderUri?: UriComponents;
}

export class RemaxWorkspaceProvider implements IWorkspaceProvider {
  public readonly trusted = true;
  public constructor(public readonly workspace: IWorkspace, public readonly payload?: object) {}
  public async open(
    workspace: IWorkspace,
    options?: { reuse?: boolean | undefined; payload?: object | undefined } | undefined,
  ) {
    // throw new Error('Method not implemented.');
    return true;
  }
  public static create(workbench: any, params?: IWorkspaceProviderParams): RemaxWorkspaceProvider {
    const folderUri = workbench.URI.parse('remaxfs:/');
    return new RemaxWorkspaceProvider({ folderUri });
  }
}
