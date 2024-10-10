/* eslint-disable curly */
import type { URI } from "vscode-uri";
import { IWorkspaceProvider, IWorkspace, UriComponents } from "./types";

export class RemaxWorkspaceProvider implements IWorkspaceProvider {
  public readonly trusted = true;
  public constructor(
    public readonly workspace: IWorkspace,
    public readonly payload?: object,
  ) {}

  private isFolderUri(workspace: IWorkspace): workspace is { folderUri: URI } {
    return (workspace as { folderUri: URI }).folderUri !== undefined;
  }

  /**
   * Implements of vscode default command: openuri
   * @param workspace IWorkspace
   * @param options options
   * @returns success
   */
  public async open(
    workspace: IWorkspace,
    options?: { reuse?: boolean; payload?: object },
  ): Promise<boolean> {
    console.log("trigger open", workspace, options);
    if (this.isFolderUri(workspace)) {
      const { path, fragment, query } = workspace.folderUri;
      const targetHref = `${window.location.origin}/p${path}?${query}#${fragment}`;
      if (options?.reuse) {
        window.location.href = targetHref;
      } else {
        window.open(targetHref, "_blank");
      }
      return true;
    }
    return false;
  }

  public static async create(workbench: any): Promise<RemaxWorkspaceProvider> {
    const pathname = window.location.pathname;
    const [_blank, tag, project, ...paths] = pathname.split("/");
    // if (tag !== 'p' || !project) {
    //   // redirect to /p/playground
    //   window.location.href = `${window.location.origin}/p/${WORKBENCH_DEFAULT_PLAYGROUND_NAME}`;
    // }

    const folderUri = workbench.URI.from({
      scheme: "zenfs",
      path: `/workspace`,
      query: window.location.search,
      fragment: window.location.hash,
    });

    return new RemaxWorkspaceProvider({ folderUri });
  }
}
