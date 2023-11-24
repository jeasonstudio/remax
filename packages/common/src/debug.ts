import cd from 'debug';

export const createDebug = (namespace?: string) => cd(`remax:${namespace ?? 'default'}`);
