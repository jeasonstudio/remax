import path from 'path';
import pkg from './package.json';
import { defineConfig } from 'umi';
import CopyWebpackPlugin from 'copy-webpack-plugin';

const extensionsInPkg = Object.keys(
  Object.assign({}, pkg.devDependencies, pkg.dependencies),
).filter((name) => name.startsWith('@remax-ide/extension-'));

export default defineConfig({
  routes: [{ path: '/', component: 'index' }],
  mfsu: false,
  writeToDisk: true,
  chainWebpack(memo) {
    const config: any = {
      patterns: [
        ...[...extensionsInPkg, '@remax-ide/marketplace'].map((depName) => ({
          from: `node_modules/${depName}`,
          to: `resources/${depName}`,
          force: true,
          globOptions: {
            ignore: [path.join('**', depName, 'node_modules')],
          },
        })),
      ],
    };
    memo.plugin('copy-webpack-plugin').use(CopyWebpackPlugin, [config]);
  },
});
