/// <reference types="vitest" />

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from "path";


// https://vite.dev/config/
export default defineConfig({
  test: {
    globals: true,
    setupFiles: './src/setup.ts',
    coverage: {
      reporter: ['text', 'json', 'html'],
    },
  },
  plugins: [react()],
  resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@components': path.resolve(__dirname, './src/components'),
        '@lib': path.resolve(__dirname, './src/lib'),
        '@hooks': path.resolve(__dirname, './src/hooks'),
      },
    },
})
