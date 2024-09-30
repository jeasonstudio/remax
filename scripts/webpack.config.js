/** @typedef {import('webpack').Configuration} WebpackConfig **/

/** @type WebpackConfig */
module.exports = [require('./extension.webpack.config'), require('./workbench.webpack.config')];
