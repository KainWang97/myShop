import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  define: {
    // Polyfill process.env for the Google GenAI SDK usage pattern
    'process.env': process.env
  }
})