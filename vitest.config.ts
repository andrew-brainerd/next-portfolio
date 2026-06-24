import { defineConfig, configDefaults } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    // Playwright e2e specs run via `pnpm e2e`, not Vitest.
    exclude: [...configDefaults.exclude, 'e2e/**']
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  }
});
