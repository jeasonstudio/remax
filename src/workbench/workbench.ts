import { RemaxWorkspaceProvider } from "./workspace";
import { IWorkbenchConstructionOptions } from "./vs/web.api";
import { create, URI } from "./vs/workbench.main";

const workspaceProvider = await RemaxWorkspaceProvider.create();
const additionalBuiltinExtensions: URI[] = [
  URI.parse(`${window.location.origin}/extension`),
];

const config: IWorkbenchConstructionOptions = {
  settingsSyncOptions: {
    enabled: false, // TODO: disable settings sync for now
  },
  workspaceProvider,
  additionalBuiltinExtensions,
  productConfiguration: {
    version: "1.93.1",
    nameShort: "Remax",
    nameLong: "Remax IDE",
    applicationName: "remaxide",
    dataFolderName: ".remax",
    urlProtocol: "remaxide",
    reportIssueUrl: "https://github.com/jeasonstudio/remax/issues/new",
    webEndpointUrlTemplate: `${window.location.origin}/${process.env.VSCODE_WEB_COMMIT}`,
  },
  configurationDefaults: {},
};

// see: src/vs/workbench/browser/web.main.ts
create(document.body, config);
