import { defineConfig } from '@playwright/test';
import dotenv from 'dotenv';

dotenv.config();

export default defineConfig({
  testDir: './tests',
  globalSetup: './src/helpers/global.setup.js',
  fullyParallel: false,
  workers: 1,
  reporter: 'html',
  use: {
    baseURL: 'https://apichallenges.eviltester.com',
    extraHTTPHeaders: {
      'Content-Type': 'application/json',
    },
  },
});
