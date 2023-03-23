import type IndexedDBFileSystem from 'browserfs/dist/node/backend/IndexedDB';
import type { Stats, Dirent } from 'node:fs';

export type FileSystem = IndexedDBFileSystem;
export type NodeStats = Stats;
export type NodeDirent = Dirent;
