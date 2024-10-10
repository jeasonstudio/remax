import { IWorkspaceProvider, IWorkspace } from "./vs/web.api";
import { URI } from "./vs/workbench.main";

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
    if (this.isFolderUri(workspace)) {
      const { path, query, fragment } = workspace.folderUri;
      const targetPath = `/p${path}${query ? `?${query}` : ""}${fragment ? `#${fragment}` : ""}`;
      if (options?.reuse) {
        window.location.pathname = targetPath;
      } else {
        window.open(targetPath, "_blank");
      }
      return true;
    }
    return false;
  }

  public static async create(): Promise<RemaxWorkspaceProvider> {
    const pathname = window.location.pathname;
    const [_blank, scheme, project, ...paths] = pathname.split("/");

    const folderUri = URI.from({
      scheme: "zenfs",
      path: `/${project ?? ""}`,
      query: window.location.search,
      fragment: window.location.hash,
    });

    return new RemaxWorkspaceProvider({ folderUri });
  }
}
