import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  testMatch: '**/*.pl.ts',
  timeout: 30_000,
  retries: 0,
  use: {
    baseURL: 'http://localhost:4000',
    headless: true
  },
  webServer: {
    command: 'npm run start',
    url: 'http://localhost:4000',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000
  }
});
