import { Autowired } from '@opensumi/di';
import {
  ClientAppContribution,
  Domain,
  IClientApp,
  Uri,
  UriUtils,
  URI,
  FsProviderContribution,
  CommandContribution,
  CommandRegistry,
  QuickPickService,
  IQuickInputService,
  localize,
} from '@opensumi/ide-core-browser';
import { WorkbenchEditorService } from '@opensumi/ide-editor';
import { IFileServiceClient } from '@opensumi/ide-file-service';
import { IWorkspaceService } from '@opensumi/ide-workspace';
import { createDebug } from '@remax-ide/common/debug';
import { IMessageService } from '@opensumi/ide-overlay';
import { REMAX_PROJECT_CREATE_COMMAND, REMAX_PROJECT_OPEN_COMMAND } from './commands';

const debug = createDebug('website:workspace');

@Domain(ClientAppContribution, FsProviderContribution, CommandContribution)
export class WorkspaceContribution
  implements ClientAppContribution, FsProviderContribution, CommandContribution
{
  @Autowired(IFileServiceClient)
  private readonly fileService: IFileServiceClient;

  @Autowired(IWorkspaceService)
  private readonly workspaceService: IWorkspaceService;

  @Autowired(WorkbenchEditorService)
  private readonly editorService: WorkbenchEditorService;

  @Autowired(IMessageService)
  private readonly messageService: IMessageService;

  @Autowired(QuickPickService)
  private readonly quickPickService: QuickPickService;

  @Autowired(IQuickInputService)
  private readonly quickInputService: IQuickInputService;

  @Autowired(IClientApp)
  private readonly clientApp: IClientApp;

  private readonly rootWorkspaceUri = Uri.from({ scheme: 'file', path: '/workspace/' });
  private readonly playgroundUri = UriUtils.joinPath(this.rootWorkspaceUri, 'playground');

  private projectUri = this.playgroundUri;
  private defaultOpenFile: string | null = null;

  constructor() {
    const { pathname } = window.location; // TODO: support hash
    let project: string = '';

    // /w/:project
    // /w/:project/:path
    // /w/:project/:path#L{line}
    const match = pathname.match(/^\/w\/([^\/]+)(?:\/(.*))?$/);
    if (match) {
      project = match[1] || 'playground';
      this.defaultOpenFile = match[2] ?? null;
    }

    this.projectUri = UriUtils.joinPath(this.rootWorkspaceUri, project);
    this.clientApp.config.workspaceDir += project;
  }

  async onFileServiceReady(): Promise<void> {
    try {
      await this.createProject('playground');
    } catch (error) {}
  }

  async initialize(app: IClientApp): Promise<void> {
    const tree = await this.getWorkspaces();
    debug('initialize with app config:', app.config);
    debug('initialize workspaces tree:', tree);
  }

  async onDidStart(): Promise<void> {
    if (this.defaultOpenFile) {
      const fileUri = UriUtils.joinPath(this.projectUri, this.defaultOpenFile);
      const fileStat = await this.fileService.getFileStat(fileUri.toString(true));
      if (!!fileStat && !fileStat.isDirectory) {
        await this.editorService.open(URI.from(fileUri));
      }
    }
  }

  async getWorkspaces() {
    const walk = async (_uri: Uri) => {
      const stat = await this.fileService.getFileStat(_uri.toString(true), true);
      const currentObject: any = {};
      for (const child of stat?.children || []) {
        currentObject[child.uri] = child.isDirectory
          ? await walk(Uri.parse(child.uri))
          : await this.fileService.readFile(child.uri);
      }
      return currentObject;
    };
    const tree = await walk(Uri.from({ scheme: 'file', path: '/workspace/' }));
    return tree;
  }

  registerCommands(commands: CommandRegistry): void {
    commands.registerCommand(REMAX_PROJECT_OPEN_COMMAND, {
      execute: async () => {
        const projects = await this.getProjects();
        const result = await this.quickPickService.show(projects, {
          title: localize('remax.workspace.open-project'),
          placeholder: localize('remax.workspace.open-project-placeholder'),
        });
        if (result) this.openProject(result);
      },
    });

    commands.registerCommand(REMAX_PROJECT_CREATE_COMMAND, {
      execute: async () => {
        try {
          const newProjectName = await this.quickInputService.open({
            title: localize('remax.workspace.create-project'),
            placeHolder: localize('remax.workspace.create-project-placeholder'),
          });
          if (!newProjectName) return;
          await this.createProject(newProjectName!);
          await this.openProject(newProjectName!);
        } catch (error) {
          this.messageService.error((error as Error).message);
        }
      },
    });
  }

  async createProject(name: string) {
    const newProjectUri = UriUtils.joinPath(this.rootWorkspaceUri, name);
    if (await this.fileService.access(newProjectUri.toString(true))) {
      throw new Error(`Project ${name} already exists. Do you want to open it?`);
    }
    await this.fileService.createFolder(newProjectUri.toString(true));
    await this.fileService.createFile(
      UriUtils.joinPath(newProjectUri, 'README.md').toString(true),
      { content: '# Welcome to RemaxIDE\n\nThis is an empty project.' },
    );
  }

  async getProjects(): Promise<string[]> {
    const stat = await this.fileService.getFileStat(this.rootWorkspaceUri.toString(true), true);
    return (stat?.children || [])
      .filter((child) => child.isDirectory)
      .map((child) => {
        return UriUtils.basename(Uri.parse(child.uri));
      });
  }

  async openProject(name: string, filePath?: string) {
    // TODO: should add a warning when opening a project
    // await this.editorService.closeAll(undefined, true);
    window.location.pathname = `/w/${name}${filePath ? `/${filePath}` : ''}`;
  }
}
