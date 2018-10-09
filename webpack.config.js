const { resolve } = require('path');

module.exports = {
  mode: 'development',
  output: {
    library: 'plugsy',
    path: resolve(__dirname),
    libraryTarget: 'umd',
    filename: 'plugsy.js'
  },
  resolve: {
    extensions: ['.js', '.ts']
  },
  module: {
    rules: [{ test: /\.ts$/, use: 'ts-loader' }]
  }
};
