import { defineConfig, type PluginOption } from 'vite';
import wasm from 'vite-plugin-wasm';
import path from 'path';
import { libInjectCss } from 'vite-plugin-lib-inject-css';

import topLevelAwait from 'vite-plugin-top-level-await';
import obfuscatorPlugin from "vite-plugin-javascript-obfuscator";

import { viteStaticCopy } from 'vite-plugin-static-copy'


export default defineConfig({
  assetsInclude: ['**/*.wasm'], 
  resolve: {
    alias: {
      three: path.resolve(__dirname, "./node_modules/three/"),
      "@react-three/fiber": path.resolve(
        __dirname,
        "./node_modules/@react-three/fiber/"
      ),
      '@vxengine': path.resolve(__dirname, 'src'),  
    },
    extensions: ['.tsx', '.ts', '.jsx', '.js'],  
  },
  build: {
    lib: {
      entry: path.resolve(__dirname, './src/index.ts'), // Your entry point
      name: 'vxengine',
      formats: ['es'], // Only build ESM for frontend usage
      fileName: 'index.esm',
    },
    rollupOptions: {
      external: [
        "wbg",
        "*.wasm",
        'react',
        'react-dom',
        "react/jsx-runtime",
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
        'zustand',
        '@emotion',
        'postprocessing',
      ],
      output: {
        globals: {
          react: 'React',
          three: 'THREE',
        },
      },
    },
    minify: "terser", // Minify the output for better performance
    terserOptions: {
      mangle: true, // Rename variables aggressively
      compress: true, // Further optimize
      format: {
        beautify: false // Keep it ugly
      }
    }, 
    sourcemap: false, // Enable sourcemaps for better debugging
    target: 'esnext', // Ensure modern browser support for Next.js
  },
  plugins: [
    wasm(),
    topLevelAwait(),
    libInjectCss(),
    obfuscatorPlugin({
      options: {
        compact: true, // Minify the obfuscated code
        controlFlowFlattening: false, // Avoid high performance cost
        controlFlowFlatteningThreshold: 1,
        numbersToExpressions: true,
        simplify: true,
        stringArray: true, // Replace strings with array indices
        stringArrayEncoding: ['rc4'],
        stringArrayThreshold: 1,
        transformObjectKeys: true, // Obfuscate object keys for added security
        deadCodeInjection: false, // Avoid unnecessary bundle size increase
        disableConsoleOutput: false, // Remove console.log statements
      }
    })
  ],
  define: {
    'process.env.NODE_ENV': JSON.stringify('production'), // Define NODE_ENV for frontend compatibility
  },
});