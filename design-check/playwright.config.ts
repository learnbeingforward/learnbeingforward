import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: '.',
  timeout: 60_000,
  expect: { timeout: 20_000 },
  fullyParallel: true,
  reporter: [['html', { open: 'never' }], ['list']],
  // Same file name for design and app runs, so the app is compared with the design baseline.
  snapshotPathTemplate: '{testDir}/baseline/{arg}{ext}',
  use: { deviceScaleFactor: 1, colorScheme: 'light', locale: 'en-IN', timezoneId: 'Asia/Kolkata' },
});
