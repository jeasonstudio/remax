const getExtensionMetadata = require('./get-extension-metadata');

// 生成 vscode/opensumi 插件 metadata 的 webpack 插件
class MetadataWebpackPlugin {
  name = 'MetadataWebpackPlugin';
  apply(compiler) {
    const { webpack } = compiler;
    const { Compilation } = webpack;

    const { RawSource } = webpack.sources;
    const extensionPath = compiler.context;

    compiler.hooks.thisCompilation.tap(this.name, (compilation) => {
      compilation.hooks.processAssets.tapPromise(
        {
          name: this.name,
          stage: Compilation.PROCESS_ASSETS_STAGE_SUMMARIZE,
        },
        async (assets) => {
          const metadata = await getExtensionMetadata(extensionPath);
          const jsContent = new RawSource(
            `// timestamp: ${Date.now()}\nmodule.exports = ${JSON.stringify(metadata, null, 2)};\n`,
          );
          compilation.emitAsset('metadata.js', jsContent);

          const dtsContent = new RawSource(
            `import { IExtensionBasicMetadata } from '@codeblitzjs/ide-common';
            declare const metadata: IExtensionBasicMetadata;
            export = metadata;
            `,
          );
          compilation.emitAsset('metadata.d.ts', dtsContent);
        },
      );
    });
  }
}

module.exports = MetadataWebpackPlugin;
