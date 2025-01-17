import { defineConfig, type PluginOption } from 'vite';
import wasm from 'vite-plugin-wasm';
import path from 'path';
import { libInjectCss } from 'vite-plugin-lib-inject-css';

import topLevelAwait from 'vite-plugin-top-level-await';
import obfuscatorPlugin from "vite-plugin-javascript-obfuscator";

import visualizer from 'rollup-plugin-visualizer';

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
    minify: true, // Minify the output for better performance
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
        renameGlobals: true,
        identifierNamesGenerator: "mangled",
        controlFlowFlattening: false, // Avoid high performance cost
        stringArray: true, // Replace strings with array indices
        stringArrayThreshold: 0.75, // Obfuscate 75% of strings
        deadCodeInjection: false, // Avoid unnecessary bundle size increase
        transformObjectKeys: true, // Obfuscate object keys for added security
        disableConsoleOutput: false, // Remove console.log statements
      }
    }),
  ],
  define: {
    'process.env.NODE_ENV': JSON.stringify('production'), // Define NODE_ENV for frontend compatibility
  },
});