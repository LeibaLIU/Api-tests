import { defineConfig } from '@playwright/test';
import dotenv from 'dotenv';

dotenv.config();

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
