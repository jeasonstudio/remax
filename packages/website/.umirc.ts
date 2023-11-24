import { defineConfig } from 'umi';
import path from 'path';
import fs from 'fs';
import CopyWebpackPlugin from 'copy-webpack-plugin';

const packagesDir = path.join(__dirname, '..');

const getExtensionsCopyItem = () => {
  const extensions = fs
    .readdirSync(packagesDir)
    .filter((subPkgName) => subPkgName.startsWith('extension-'));

  return extensions.map((extension) => {
    const extensionPkg = require(path.join(packagesDir, extension, 'package.json'));
    const extensionName = extensionPkg.name;
    const metadata = require(`${extensionName}/out/metadata`);
    const extensionId = `${metadata.extension.publisher}.${metadata.extension.name}-${metadata.extension.version}`;
    return {
      from: path.join(packagesDir, extension),
      to: path.join('resources/extensions', extensionId),
      toType: 'dir',
      force: true,
      globOptions: {
        ignore: [path.join('**', extensionName, 'node_modules')],
      },
    };
  });
};

const publicPath = '/@alipay/remax-website@0.0.0-alpha.1/dist/';

export default defineConfig({
  routes: [{ path: '/', component: 'index' }],
  history: { type: 'hash' },
  mfsu: false,
  writeToDisk: true,
  // 复制静态资源，用于模拟私有化环境
  // chainWebpack(memo) {
  //   const config: any = {
  //     patterns: [
  //       {
  //         from: 'node_modules/@alipay/remax-resources',
  //         to: 'resources',
  //         force: true,
  //         globOptions: {
  //           ignore: ['**/@alipay/remax-resources/node_modules'],
  //         },
  //       },
  //       ...getExtensionsCopyItem(),
  //     ],
  //   };
  //   memo.plugin('copy-webpack-plugin').use(CopyWebpackPlugin, [config]);
  // },
  jsMinifier: 'none',
  // publicPath,
  // runtimePublicPath: {},
  // headScripts: [`window.publicPath = "${publicPath}";`],
  metas: [
    {
      name: 'theme-color',
      content: '#010409',
    },
  ],
});
