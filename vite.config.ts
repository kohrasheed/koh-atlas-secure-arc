import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react-swc";
import { defineConfig, PluginOption } from "vite";

import sparkPlugin from "@github/spark/spark-vite-plugin";
import createIconImportProxy from "@github/spark/vitePhosphorIconProxyPlugin";
import { resolve } from 'path'
import { copyFileSync } from 'fs'

const projectRoot = process.env.PROJECT_ROOT || import.meta.dirname

// https://vite.dev/config/
export default defineConfig({
  base: '/koh-atlas-secure-arc/',
  plugins: [
    react(),
    tailwindcss(),
    // DO NOT REMOVE
    createIconImportProxy() as PluginOption,
    sparkPlugin() as PluginOption,
    // Copy analytics files to dist
    {
      name: 'copy-analytics',
      closeBundle() {
        try {
          copyFileSync('public/analytics.js', 'dist/analytics.js');
          copyFileSync('public/kohVisitors-dashboard.html', 'dist/kohVisitors-dashboard.html');
        } catch (e) {
          console.error('Failed to copy analytics files:', e);
        }
      }
    }
  ],
  resolve: {
    alias: {
      '@': resolve(projectRoot, 'src')
    }
  },
  define: {
    global: 'globalThis',
  },
  server: {
    host: '0.0.0.0',
    port: 5000,
    strictPort: true,
    proxy: {
      '/api/anthropic': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      }
    }
  },
});
