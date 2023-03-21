/** @typedef {import('webpack').Configuration} WebpackConfig **/

const path = require('path');
const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const pkg = require('../package.json');

const projectRoot = process.cwd();

/** @type WebpackConfig */
module.exports = {
  mode: process.env.NODE_ENV === 'production' ? 'production' : 'none', // this leaves the source code as close as possible to the original (when packaging we set this to 'production')
  entry: {
    workbench: './src/workbench/workbench.ts',
  },
  output: {
    filename: '[name].js',
    path: path.join(projectRoot, './dist'),
  },
  resolve: {
    mainFields: ['browser', 'module', 'main'], // look for `browser` entry point in imported node modules
    extensions: ['.ts', '.js'], // support ts-files and js-files
    alias: {
      // provides alternate implementation for node module and source files
    },
    fallback: {
      // Webpack 5 no longer polyfills Node.js core modules automatically.
      // see https://webpack.js.org/configuration/resolve/#resolvefallback
      // for the list of Node.js core module polyfills.
    },
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'ts-loader',
          },
        ],
      },
    ],
  },
  plugins: [
    // new webpack.optimize.LimitChunkCountPlugin({
    //   maxChunks: 1, // disable chunks by default since web extensions must be a single bundle
    // }),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
      'process.env.VSCODE_WEB_VERSION': JSON.stringify(pkg.vscodeweb.version),
      'process.env.VSCODE_WEB_COMMIT': JSON.stringify(pkg.vscodeweb.commit),
      BUILTIN_EXTENSIONS_METADATA: JSON.stringify('["javascript"]'),
      'process.env.BUILTIN_EXTENSIONS_BASE_URL': JSON.stringify(`/${pkg.vscodeweb.commit}/extensions`),
    }),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: path.join(projectRoot, '.vscodeweb', pkg.vscodeweb.commit),
          to: path.join(projectRoot, 'dist', pkg.vscodeweb.commit),
          force: true,
        },
        {
          from: path.join(projectRoot, 'scripts/_redirect.txt'),
          to: path.join(projectRoot, 'dist/_redirect'),
          toType: 'file',
        },
      ],
    }),
    new HtmlWebpackPlugin({
      minify: false,
      filename: 'index.html',
      template: 'src/workbench/workbench.html',
      // envs: package json info
      package: pkg,
      // envs: vscode web info
      vscodeweb: pkg.vscodeweb,
      // envs: vscode web static path
      static: path.join('.', pkg.vscodeweb.commit),
    }),
  ],
  externals: {
    vscode: 'commonjs vscode', // ignored because it doesn't exist
  },
  performance: {
    hints: false,
  },
  devtool: 'nosources-source-map', // create a source map that points to the original source file
  infrastructureLogging: {
    level: 'info', // enables logging required for problem matchers
  },
  stats: 'minimal',
  optimization: {
    minimize: false,
  },
};
