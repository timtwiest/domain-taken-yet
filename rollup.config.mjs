import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import typescript from '@rollup/plugin-typescript';

export default {
  input: 'index.ts',
  output: [
    {
      file: 'dist/index.esm.js',
      format: 'esm',
      banner: '#!/usr/bin/env node',
      sourcemap: true
    },
    {
      file: 'dist/index.cjs.js',
      format: 'cjs',
      banner: '#!/usr/bin/env node',
      sourcemap: true
    },
  ],
  plugins: [resolve(), commonjs(), json(), typescript()],
};
