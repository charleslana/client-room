import { fileURLToPath, URL } from 'node:url';

import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  build: {
    assetsDir: 'src/assets',
    rollupOptions: {
      output: {
        assetFileNames: (assetInfo) => {
          const isFont =
            assetInfo.name &&
            (assetInfo.name.endsWith('.woff2') || assetInfo.name.endsWith('.ttf'));
          const outputDir = isFont ? 'fonts' : 'images';
          return `src/assets/${outputDir}/[name].[ext]`;
        }
      }
    }
  }
});
