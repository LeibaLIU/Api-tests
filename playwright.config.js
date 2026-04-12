import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  reporter: 'html',
  use: {
    baseURL: 'https://apichallenges.eviltester.com',
    extraHTTPHeaders: {
      'Content-Type': 'application/json',
    },
  },
});
