import { FileSystemConfiguration, RuntimeConfig } from '@codeblitzjs/ide-sumi-core';
import { createDebug } from './debug';

const debug = createDebug('workspace');

export const createWorkspace = (
  options: RuntimeConfig['workspace'] & { filesystem: FileSystemConfiguration },
) => ({
  onDidSaveTextDocument: (...argv) => debug('onDidSaveTextDocument', ...argv),
  onDidChangeTextDocument: (...argv) => debug('onDidChangeTextDocument', ...argv),
  onDidCreateFiles: (...argv) => debug('onDidCreateFiles', ...argv),
  onDidDeleteFiles: (...argv) => debug('onDidDeleteFiles', ...argv),
  onDidChangeFiles: (...argv) => debug('onDidChangeFiles', ...argv),
  ...options,
});
