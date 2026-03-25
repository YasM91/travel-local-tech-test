import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      exclude: [
        'node_modules/**',
        '.next/**',
        'coverage/**',
        '**/*.d.ts',
        '**/*.config.*',
        'pages/_app*',
        'pages/_document*',
      ],
    },
  },
})
