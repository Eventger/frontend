import path from 'node:path'

import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

const projectRoot = path.resolve(
  import.meta.dirname,
  '../..',
)

export default defineConfig({
  root: projectRoot,
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: [
      {
        find: /^@clerk\/react$/,
        replacement: path.resolve(
          import.meta.dirname,
          'clerk.mock.tsx',
        ),
      },
      { find: '@', replacement: path.resolve(projectRoot, 'src') },
    ],
  },
})
