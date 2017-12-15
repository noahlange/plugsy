import typescript from 'rollup-plugin-typescript2';
import minify from 'rollup-plugin-babel-minify';

export default {
  input: './src/main.ts',
  output: {
    file: './plugsy.js',
    name: 'plugsy',
    format: 'umd'
  },
  plugins: [
    typescript({ clean: true, check: false }),
    minify({ comments: false })
  ]
};