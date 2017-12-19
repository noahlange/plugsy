import minify from 'rollup-plugin-babel-minify';
import sourcemaps from 'rollup-plugin-sourcemaps';

export default {
  input: './dist/main.js',
  output: {
    file: './plugsy.js',
    name: 'plugsy',
    format: 'umd'
  },
  sourceMap: 'inline',
  plugins: [
    sourcemaps(),
    minify({ comments: false })
  ]
};