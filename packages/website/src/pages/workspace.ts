import { createWorkspace } from '@remax-ide/common';
import manifest from '../contracts/manifest.json';

interface FileItem {
  name: string;
  path: string;
  entries?: FileItem[];
}

const loadContracts: any = (item: FileItem) => {
  if (!item.entries) {
    return require(`!!raw-loader!../contracts/${item.path}`).default;
  } else {
    return Object.fromEntries(item.entries.map((n) => [n.name, loadContracts(n)]));
  }
};

const contracts = loadContracts(manifest);

export const workspace = createWorkspace({
  filesystem: {
    fs: 'FileIndexSystem',
    options: {
      requestFileIndex: async () => ({ contracts, 'README.md': '# Welcome' }),
    },
  },
});
