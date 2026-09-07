import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    base: (env.VITE_BASENAME && env.VITE_BASENAME !== '/') ? env.VITE_BASENAME + '/' : '/',
    build: {
      outDir: path.resolve(__dirname, '../API/wwwroot'),
      emptyOutDir: true,
    },
    server: {
      port: 3000
    },
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  }
})
