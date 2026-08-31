import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist/client', // Ép Vite đóng gói giao diện vào dist/client
    emptyOutDir: false     // Ngăn Vite xóa nhầm tệp server.cjs của esbuild
  }
});
