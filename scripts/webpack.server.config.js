/** @typedef {import('webpack').Configuration} WebpackConfig **/

const path = require('path');
const webpack = require('webpack');
const MetadataWebpackPlugin = require('./metadata-webpack-plugin');

const projectRoot = process.cwd();

/** @type WebpackConfig */
module.exports = {
  mode: process.env.NODE_ENV === 'production' ? 'production' : 'none', // this leaves the source code as close as possible to the original (when packaging we set this to 'production')
  target: 'webworker', // extensions run in a webworker context
  entry: {
    'server': './src/server.ts',
  },
  output: {
    filename: '[name].js',
    path: path.join(projectRoot, 'dist'),
    libraryTarget: 'var',
    library: 'serverExportVar',
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
      path: require.resolve('path-browserify'),
      buffer: require.resolve('buffer/'),
      stream: require.resolve('stream-browserify'),
      http: false,
      https: false,
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
            options: {
              transpileOnly: true,
            },
          },
        ],
      },
    ],
  },
  plugins: [
    new webpack.optimize.LimitChunkCountPlugin({
      maxChunks: 1, // disable chunks by default since web extensions must be a single bundle
    }),
    new webpack.ProvidePlugin({
      process: 'process/browser', // provide a shim for the global `process` variable
    }),
    new MetadataWebpackPlugin(),
  ],
  externals: {
    vscode: 'commonjs vscode', // ignored because it doesn't exist
    sumi: 'commonjs sumi', // ignored because it doesn't exist
    'sumi-browser': 'commonjs sumi-browser', // ignored because it doesn't exist
  },
  performance: {
    hints: false,
  },
  devtool: 'nosources-source-map', // create a source map that points to the original source file
  infrastructureLogging: {
    level: 'log', // enables logging required for problem matchers
  },
  stats: 'minimal',
};
