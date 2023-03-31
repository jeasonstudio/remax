/**
 * FileSystem Provider scheme.
 * Such as `remaxfs:/foo/bar.txt`
 */
export const FILE_SYSTEM_SCHEME = 'remaxfs';
/**
 * The default file system name.
 * Foe IndexedDB
 */
export const FILE_SYSTEM_NAME = 'remax_file_system';
/**
 * The default playground name.
 * Will auto open `remaxfs:/playground` when open without params.
 */
export const WORKBENCH_DEFAULT_PLAYGROUND_NAME = 'playground';

const versions = require('./versions.json');

export const DEFAULT_SOLJSON_VERSION = versions.releases[versions.latestRelease];
