import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    exclude: ['node_modules', 'dist', 'out'],
    globals: true,
    env: {
      VITE_USE_REAL_API: process.env.VITE_USE_REAL_API || 'false',
      USE_REAL_API: process.env.USE_REAL_API || 'false',
    },
    testTimeout: 60000,
    hookTimeout: 30000,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.*',
        'dist/',
        'out/',
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src/renderer/src'),
    },
  },
  define: {
    'process.env.VITE_USE_REAL_API': JSON.stringify(process.env.VITE_USE_REAL_API || 'false'),
    'process.env.USE_REAL_API': JSON.stringify(process.env.USE_REAL_API || 'false'),
  },
}) 