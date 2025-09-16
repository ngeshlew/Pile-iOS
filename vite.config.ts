import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'node:path';

export default defineConfig({
  plugins: [
    react({
      jsxImportSource: 'react',
      // Transform React JSX in any .js/.jsx/.ts/.tsx under src
      include: [
        /src\/.*\.jsx?$/,
        /src\/.*\.tsx?$/,
      ],
    }),
  ],
  esbuild: {
    jsx: 'automatic',
    include: /src\/.*\.[jt]sx?$/,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
  resolve: {
    alias: {
      renderer: path.resolve(__dirname, 'src/renderer'),
    },
  },
  server: {
    port: 5173,
    strictPort: true,
  },
});
