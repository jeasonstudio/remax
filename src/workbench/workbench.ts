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
  // welcomeBanner: {
  //   message: 'Welcome to Remax IDE!',
  // },
  productConfiguration: {
    nameShort: "Remax IDE",
    nameLong: "Remax IDE",
    version: "1.93.1",
    date: "2023-03-19",
    portable: true,
    applicationName: "remaxide",
    dataFolderName: ".remax-extensions",
    licenseName: "MIT",
    licenseUrl: "https://github.com/jeasonstudio/remax/blob/main/LICENSE",
    licenseFileName: "LICENSE",
    reportIssueUrl: "https://github.com/jeasonstudio/remax/issues/new",
    urlProtocol: "remaxide",
    // webviewContentExternalBaseUrlTemplate:
    //   'https://{{uuid}}.vscode-cdn.net/insider/ef65ac1ba57f57f2a3961bfe94aa20481caca4c6/out/vs/workbench/contrib/webview/browser/pre/',
    // builtInExtensions: [],
    webEndpointUrlTemplate: `${window.location.origin}/${process.env.VSCODE_WEB_COMMIT}`,
    // Set commit to falsy means environment is development
    // src/vs/workbench/services/environment/browser/environmentService.ts#45
    // commit: null,
  },
  configurationDefaults: {
    "workbench.colorTheme": "Default Light Modern",
  },
};

// see: src/vs/workbench/browser/web.main.ts
(() => create(document.body, config))();
