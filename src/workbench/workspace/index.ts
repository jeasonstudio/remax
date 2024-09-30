/* eslint-disable curly */
import { URI } from 'vscode-uri';
import { FILE_SYSTEM_SCHEME, WORKBENCH_DEFAULT_PLAYGROUND_NAME } from '../../constants';

export type UriComponents = typeof URI;

export type Workspace = any;
export class RemaxWorkspaceProvider {
  public readonly trusted = true;
  public constructor(public readonly workspace: Workspace, public readonly payload?: object) {}

  /**
   * Implements of vscode default command: openuri
   * @param workspace Workspace
   * @param options options
   * @returns success
   */
  public open(
    workspace: Workspace,
    options?: { reuse?: boolean | undefined; payload?: object | undefined } | undefined,
  ): boolean {
    console.log('trigger open', workspace, options);
    if (workspace?.folderUri) {
      const { path, fragment, query } = workspace.folderUri;
      const targetHref = `${window.location.origin}/p${path}?${query}#${fragment}`;
      if (options?.reuse) {
        window.location.href = targetHref;
      } else {
        window.open(targetHref, '_blank');
      }
      return true;
    }
    return false;
  }

  public static async create(workbench: any): Promise<RemaxWorkspaceProvider> {
    const pathname = window.location.pathname;
    const [_blank, tag, project, ...paths] = pathname.split('/');
    // if (tag !== 'p' || !project) {
    //   // redirect to /p/playground
    //   window.location.href = `${window.location.origin}/p/${WORKBENCH_DEFAULT_PLAYGROUND_NAME}`;
    // }

    const folderUri = workbench.URI.from({
      scheme: FILE_SYSTEM_SCHEME,
      path: `/${project ?? ''}`,
      query: window.location.search,
      fragment: window.location.hash,
    });

    return new RemaxWorkspaceProvider({ folderUri });
  }
}
