import { defineConfig } from 'vite';
import wasm from 'vite-plugin-wasm';
import path from 'path';

export default defineConfig({
  assetsInclude: ['**/*.wasm'], 
  resolve: {
    alias: {
      '@vxengine': path.resolve(__dirname, 'src'),  
    },
    extensions: ['.tsx', '.ts', '.jsx', '.js'],  
  },
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'), // Your entry point
      name: 'vxengine',
      formats: ['es'], // Only build ESM for frontend usage
      fileName: 'index',
    },
    rollupOptions: {
      external: [
        'react', 
        'three', 
        '@react-three/fiber',  // Externalize @react-three/fiber
        '@react-three/drei',   // Externalize @react-three/drei
        '@react-three/postprocessing',  // Externalize @react-three/postprocessing
      ],
      output: {
        globals: {
          react: 'React',
          three: 'THREE',
        },
      },
    },
    minify: true, // Minify the output for better performance
    sourcemap: true, // Enable sourcemaps for better debugging
    target: 'esnext', // Ensure modern browser support for Next.js
  },
  plugins: [
    wasm()
  ],
  define: {
    'process.env.NODE_ENV': JSON.stringify('production'), // Define NODE_ENV for frontend compatibility
  },
});