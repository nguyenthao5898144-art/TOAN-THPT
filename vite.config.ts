import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      external: [
        'fsevents', 'path', 
        './1.tsx', './12.tsx', './13.tsx', './14.tsx', './15.tsx',
        './16.tsx', './17.tsx', './18.tsx', './19.tsx', './20.tsx',
        './21.tsx', './22.tsx', './23.tsx', './24.tsx', './25.tsx'
      ]
    }
  }
});
