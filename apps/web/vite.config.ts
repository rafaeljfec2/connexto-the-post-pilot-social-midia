import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, __dirname, '')

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': resolve(__dirname, './src'),
        '@components': resolve(__dirname, './src/components'),
        '@lib': resolve(__dirname, './src/lib'),
        '@hooks': resolve(__dirname, './src/hooks'),
        '@store': resolve(__dirname, './src/store'),
        '@styles': resolve(__dirname, './src/styles'),
        '@types': resolve(__dirname, './src/types'),
        '@utils': resolve(__dirname, './src/utils'),
        '@services': resolve(__dirname, './src/services'),
        '@assets': resolve(__dirname, './src/assets'),
      },
    },
    server: {
      port: Number.parseInt(env.VITE_PORT || '3000'),
      host: true,
      proxy: {
        '/the-post-pilot/v1': {
          target: env.VITE_API_URL || 'http://localhost:8081',
          changeOrigin: true,
          secure: false,
        },
      },
    },
    build: {
      sourcemap: true,
    },
  }
})
