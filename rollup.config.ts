import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import resolve from '@rollup/plugin-node-resolve';
import typescript from 'rollup-plugin-typescript2';

export default {
  input: 'src/index.ts', // Adjust the entry point according to your project structure
  output: {
    file: 'bin/cli.js',
    format: 'cjs',
    banner: '#!/usr/bin/env node', // Add the shebang for CLI
    inlineDynamicImports: true,
  },
  plugins: [
    resolve({
      rootDir: 'src/',
    }),
    json(),
    commonjs({}),
    typescript({ tsconfig: './tsconfig.cli.json' }),
  ],
};
