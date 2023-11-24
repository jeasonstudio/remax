/** @typedef {import('webpack').Configuration} WebpackConfig **/

/** @type WebpackConfig */
module.exports = [
  require('../../scripts/webpack.extension.config'),
  require('../../scripts/webpack.server.config'),
];
