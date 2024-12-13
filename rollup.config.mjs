import json from '@rollup/plugin-json';
import path from 'path';
import alias from '@rollup/plugin-alias';
import nodeResolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';
import babel from '@rollup/plugin-babel';
import postcss from 'rollup-plugin-postcss';
import copy from 'rollup-plugin-copy';
import url from '@rollup/plugin-url';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default [
  {
    input: './src/index.tsx',
    external: [
      'react',
      'react-dom',
      'three',
      '@react-three/fiber',
      '@react-three/drei',
      '@react-three/postprocessing',
      'three-stdlib',
      'zustand',
      'howler',
      'framer-motion',
      'immer',
      'next-themes',
      'classnames',
      'clsx',
      'tailwind-merge',
      'tailwindcss',
      'lodash',
      'baffle',
      'scss',
      'postprocessing',
    ],
    plugins: [
      json(),
      alias({
        entries: [
          { find: '@vxengine', replacement: path.resolve(__dirname, 'src') }
        ]
      }),
      nodeResolve({
        extensions: ['.ts', '.tsx', '.js', '.jsx']
      }),
      babel({
        babelHelpers: 'bundled',
        presets: ['@babel/preset-react'],
        extensions: ['.ts', '.tsx', '.js', '.jsx']
      }),
      typescript({
        tsconfig: path.resolve(__dirname, 'tsconfig.json')
      }),
      postcss({
        extensions: ['.css', '.scss', '.sass'],
        extract: true,
        minimize: false,
        plugins: [
            tailwindcss(),
            autoprefixer(),
        ]
      }),
      url({
        include: ['**/*.woff', '**/*.woff2', '**/*.eot', '**/*.ttf', '**/*.otf', '**/*.wasm'],
        limit: 0,
        fileName: 'assets/[name][extname]'
      }),
      copy({
        targets: [
          { src: 'scripts/**/*', dest: 'dist/scripts' }
        ]
      }),
    ],
    output: [
      {
        file: 'dist/index.cjs.js', // or the value from package.json main
        format: 'cjs',
        sourcemap: true,
      },
      {
        file: 'dist/index.esm.js', // or the value from package.json module
        format: 'esm',
        sourcemap: true,
      },
    ],
  }
];