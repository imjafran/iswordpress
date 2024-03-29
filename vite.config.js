const path = require('path')
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  build: {
    rollupOptions: {
        input: { 
            main: './src/main.js',
        },
        output: {
            entryFileNames: 'js/app.min.js',
            assetFileNames: 'css/app.min.css',
            formats: ['iife'],
        }
    },

    outDir: './dist',
    minify: true,
    sourcemap: false,
    emptyOutDir: true,
    // watch
    watch: {
        include: 'src/**',
        exclude: 'node_modules/**',
        clearScreen: true,
        // interval: 1000
    },

    // development mode
    mode: 'development',

  },
});
