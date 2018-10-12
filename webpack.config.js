const { resolve } = require('path');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
  mode: 'development',
  output: {
    library: 'plugsy',
    path: resolve(__dirname),
    libraryTarget: 'umd',
    filename: 'plugsy.js'
  },
  plugins: [
    new TerserPlugin({
      terserOptions: {
        mangle: false,
        keep_fnames: true,
        keep_classnames: true
      }
    })
  ],
  resolve: {
    extensions: ['.js', '.ts']
  },
  module: {
    rules: [{ test: /\.ts$/, use: 'ts-loader' }]
  }
};
