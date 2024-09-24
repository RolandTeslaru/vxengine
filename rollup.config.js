import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import wasm from '@rollup/plugin-wasm';

export default {
  input: 'src/index.ts', // Adjust the entry point as needed
  output: {
    dir: 'dist',
    format: 'cjs', // or 'es' if you prefer ES modules
    sourcemap: true,
  },
  plugins: [
    resolve(),
    commonjs(),
    typescript(),
    wasm(),
  ],
  external: ['react', 'three'], // List external dependencies here
};