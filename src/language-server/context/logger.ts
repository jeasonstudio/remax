import { Connection } from 'vscode-languageserver/browser';

export class Logger {
  public constructor(private readonly connection: Connection) {}

  public log(arg: string): void {
    this.connection.console.log(this._tryPrepend(arg));
  }

  public info(arg: string): void {
    this.connection.console.info(this._tryPrepend(arg));
  }

  public error(err: unknown): void {
    if (err instanceof Error) {
      this.connection.console.error(this._tryPrepend(err.message));
    } else if (this._hasErrorDescriptor(err)) {
      this.connection.console.error(
        this._tryPrepend(`${err.errorDescriptor.title}: ${err.errorDescriptor.description}`),
      );
    } else {
      this.connection.console.error(this._tryPrepend(JSON.stringify(err)));
    }
  }

  public trace(message: string, verbose?: Record<string, unknown> | undefined): void {
    this.connection.tracer.log(this._tryPrepend(message), JSON.stringify(verbose));
  }

  private _tryPrepend(arg: string) {
    return arg; // TODO: needs some prefix
  }

  private _hasErrorDescriptor(err: unknown): err is { errorDescriptor: { title: string; description: string } } {
    if (typeof err !== 'object' || err === null) {
      return false;
    }

    return 'errorDescriptor' in err;
  }

  public async trackTime(description: string, callback: () => Promise<unknown>) {
    this.trace(`${description}: Start`);
    const startTime = new Date().getTime();
    try {
      await callback();
    } finally {
      this.trace(`${description}: End (${new Date().getTime() - startTime}ms)`);
    }
  }
}
