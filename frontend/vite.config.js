import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path';
// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@import "@/styles/global.scss";`
      }
    }
  },
  server: {
    watch: {
      usePolling: true,
      interval: 100
    },
    host: '0.0.0.0',
    port: 5173,
    hmr: {
      clientPort: 5173,
      host: '0.0.0.0'
    }
  }
})
