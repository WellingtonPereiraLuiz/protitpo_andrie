import { defineConfig } from '@playwright/test';

// Roda contra o build de produção (`next start`), não contra o `next dev`.
// No `npm run check` o `next build` vem antes; rodando sozinho, faça `npm run build` primeiro.
const PORTA = 3100;

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: `http://localhost:${String(PORTA)}`,
    browserName: 'chromium',
    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'mobile-390', use: { viewport: { width: 390, height: 844 } } },
    { name: 'desktop-1440', use: { viewport: { width: 1440, height: 900 } } },
  ],
  webServer: {
    command: `npx next start -p ${String(PORTA)}`,
    url: `http://localhost:${String(PORTA)}`,
    // Nunca reaproveita um servidor que já esteja de pé: o teste é sempre contra este build.
    reuseExistingServer: false,
    timeout: 60_000,
  },
});
