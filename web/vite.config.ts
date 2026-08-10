import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Share the pure-TS game logic directly from the mobile project
      '@game': path.resolve(__dirname, '../src/game'),
      '@data': path.resolve(__dirname, '../src/data'),
    },
  },
});
