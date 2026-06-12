#!/usr/bin/env node
import { createRequire } from 'node:module';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';

const require = createRequire(import.meta.url);
function loadPlaywright() {
  const candidates = [
    process.env.PLAYWRIGHT_PACKAGE,
    'playwright',
    '/home/manuel/.npm/_npx/9833c18b2d85bc59/node_modules/playwright',
  ].filter(Boolean);
  for (const candidate of candidates) {
    try { return require(candidate); } catch { /* try next */ }
  }
  throw new Error('Could not load Playwright. Set PLAYWRIGHT_PACKAGE=/path/to/node_modules/playwright.');
}

const { chromium } = loadPlaywright();
const storybookURL = process.env.STORYBOOK_URL || 'http://127.0.0.1:6006';
const outDir = process.env.HAIR_STORYBOOK_OUT || 'ttmp/2026/05/15/HAIR-041--real-admin-backend-for-intake-app/various/storybook-v2';

const stories = [
  ['admin-dsl-workbench-v2--target-desktop', 'desktop', { width: 1440, height: 1200 }],
  ['admin-dsl-workbench-v2--target-mobile', 'mobile', { width: 390, height: 844 }],
  ['admin-dsl-workbench-v2--service-operations', 'mobile', { width: 390, height: 844 }],
  ['admin-dsl-workbench-v2--request-triage', 'mobile', { width: 390, height: 844 }],
  ['admin-dsl-workbench-v2--draft-review-queue', 'mobile', { width: 390, height: 844 }],
  ['admin-dsl-workbench-v2--calendar-publishing', 'mobile', { width: 390, height: 844 }],
  ['admin-dsl-workbench-v2--typed-form-workbench', 'mobile', { width: 390, height: 844 }],
  ['admin-dsl-workbench-v2--empty-loading-error-states', 'mobile', { width: 390, height: 844 }],
  ['admin-dsl-workbench-v2--audit-workbench', 'mobile', { width: 390, height: 844 }],
  ['admin-dsl-workbench-v2--dense-mobile-operations', 'mobile', { width: 390, height: 844 }],
];

async function capture() {
  await mkdir(outDir, { recursive: true });
  const browser = await chromium.launch({ headless: true, channel: 'chrome' });
  try {
    for (const [id, label, viewport] of stories) {
      const page = await browser.newPage({ viewport });
      const url = `${storybookURL}/iframe.html?id=${encodeURIComponent(id)}&viewMode=story`;
      await page.goto(url, { waitUntil: 'networkidle' });
      await page.locator('[data-admin-dsl-page]').waitFor({ timeout: 20000 });
      await page.screenshot({ path: path.join(outDir, `${id}-${label}.png`), fullPage: true });
      await page.close();
      console.log(`captured ${id} ${label}`);
    }
  } finally {
    await browser.close();
  }
}

capture().catch((err) => {
  console.error(err);
  process.exit(1);
});
