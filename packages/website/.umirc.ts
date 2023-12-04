import path from 'path';
import pkg from './package.json';
import { defineConfig } from 'umi';
import CopyWebpackPlugin from 'copy-webpack-plugin';

const extensionsInPkg = Object.keys(
  Object.assign({}, pkg.devDependencies, pkg.dependencies),
).filter((name) => name.startsWith('@remax-ide/extension-'));

const isProd = process.env.NODE_ENV === 'production';

export default defineConfig({
  routes: [{ path: '/', component: 'index' }],
  mfsu: false,
  writeToDisk: true,
  define: {
    EXT_ENDPOINT: isProd ? '${window.location.origin}/resources' : 'http://localhost:3001',
  },
  chainWebpack: (memo, { webpack }) => {
    memo.plugin('remax-define').use(webpack.DefinePlugin, [
      {
        EXT_ENDPOINT: isProd ? '`${window.location.origin}/resources`' : '"http://localhost:3001"',
      },
    ]);

    if (isProd) {
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
    }
  },
});
