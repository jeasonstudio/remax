import {
  // Factory
  create,
  // Basic Types
  URI,
  Event,
  Emitter,
  Disposable,
  GroupOrientation,
  LogLevel,
  RemoteAuthorityResolverError,
  RemoteAuthorityResolverErrorCode,
  // Facade API
  env,
  window as vsWindow,
  workspace,
  commands,
  logger,
  Menu,
} from "./web.api";

export interface IWorkbenchAPI {
  Disposable: Disposable;
  Emitter: Emitter<any>;
  Event: Event<any>;
  GroupOrientation: GroupOrientation;
  LogLevel: LogLevel;
  Menu: Menu;
  RemoteAuthorityResolverError: RemoteAuthorityResolverError;
  RemoteAuthorityResolverErrorCode: RemoteAuthorityResolverErrorCode;
  URI: URI;
  commands: typeof commands;
  create: typeof create;
  env: typeof env;
  logger: typeof logger;
  window: typeof vsWindow;
  workspace: typeof workspace;
}
