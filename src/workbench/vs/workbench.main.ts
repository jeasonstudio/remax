import * as api from "./web.api";

const workbench = (globalThis as any).require(
  "vs/workbench/workbench.web.main",
);

export const Disposable: api.Disposable = workbench.Disposable;
export const Emitter: api.Emitter<void> = workbench.Emitter;
export const Event: api.Event<void> = workbench.Event;
export const GroupOrientation: api.GroupOrientation =
  workbench.GroupOrientation;
export const LogLevel: api.LogLevel = workbench.LogLevel;
export const Menu: api.Menu = workbench.Menu;
export const RemoteAuthorityResolverError: api.RemoteAuthorityResolverError =
  workbench.RemoteAuthorityResolverError;
export const RemoteAuthorityResolverErrorCode: api.RemoteAuthorityResolverErrorCode =
  workbench.RemoteAuthorityResolverErrorCode;
export { URI } from "vscode-uri";
export const commands: typeof api.commands = workbench.commands;
export const create: typeof api.create = workbench.create;
export const env: typeof api.env = workbench.env;
export const logger: typeof api.logger = workbench.logger;
export const window: typeof api.window = workbench.window;
export const workspace: typeof api.workspace = workbench.workspace;
