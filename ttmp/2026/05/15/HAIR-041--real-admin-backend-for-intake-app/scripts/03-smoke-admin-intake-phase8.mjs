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
    try {
      return require(candidate);
    } catch {
      // Try the next candidate. The final fallback matches this workstation's MCP Playwright install.
    }
  }
  throw new Error('Could not load Playwright. Set PLAYWRIGHT_PACKAGE=/path/to/node_modules/playwright.');
}

const { chromium } = loadPlaywright();

const backend = process.env.HAIR_BACKEND_URL || 'http://127.0.0.1:19080';
const web = process.env.HAIR_WEB_URL || 'http://127.0.0.1:5175';
const outDir = process.env.HAIR_SMOKE_OUT || 'ttmp/2026/05/15/HAIR-041--real-admin-backend-for-intake-app/various/playwright';

async function api(method, url, body) {
  const res = await fetch(`${backend}${url}`, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let json;
  try { json = text ? JSON.parse(text) : {}; } catch { json = { raw: text }; }
  if (!res.ok) throw new Error(`${method} ${url} failed ${res.status}: ${text}`);
  return json;
}

function walk(value, visit) {
  if (!value || typeof value !== 'object') return undefined;
  const found = visit(value);
  if (found) return found;
  if (Array.isArray(value)) {
    for (const item of value) {
      const nested = walk(item, visit);
      if (nested) return nested;
    }
  } else {
    for (const item of Object.values(value)) {
      const nested = walk(item, visit);
      if (nested) return nested;
    }
  }
  return undefined;
}

function findAction(state, predicate) {
  return walk(state.page, (node) => {
    const actions = node.actions || node.props?.actions;
    if (!actions || typeof actions !== 'object') return undefined;
    for (const action of Object.values(actions)) {
      if (action && typeof action === 'object' && predicate(action)) return action;
    }
    return undefined;
  });
}

async function postEvent(state, action, value) {
  return api('POST', `/api/dsl/flows/${encodeURIComponent(state.sessionId)}/events`, {
    eventId: crypto.randomUUID(),
    sessionId: state.sessionId,
    pageVersion: state.pageVersion,
    actionId: action.id,
    event: action.event || 'click',
    ...(value === undefined ? {} : { value }),
  });
}

async function submitCustomerRequest() {
  let state = await api('POST', '/api/dsl/flows/fringe.intake.v1/start');
  for (let i = 0; i < 6; i++) {
    const next = state.page.shell?.props?.actions?.next;
    if (!next) throw new Error(`missing next action on ${state.page.id}`);
    state = await postEvent(state, next);
  }
  if (state.page.id !== 'intake-confirm') throw new Error(`expected intake-confirm, got ${state.page.id}`);
  const submit = findAction(state, (action) => action.event === 'submit');
  if (!submit) throw new Error('missing submit action on confirm page');
  state = await postEvent(state, submit);
  return state;
}

async function smokeAdminReview() {
  await mkdir(outDir, { recursive: true });
  const submitted = await submitCustomerRequest();
  console.log(`Submitted customer flow; final page=${submitted.page.id}`);

  const browser = await chromium.launch({ headless: true, channel: 'chrome' });
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1100 } });
    await page.goto(`${web}/admin/intake`, { waitUntil: 'networkidle' });
    await page.getByText('Intake Admin').waitFor({ timeout: 15000 });
    await page.screenshot({ path: path.join(outDir, 'phase8-admin-dashboard.png'), fullPage: true });
    await page.getByRole('button', { name: /review requests/i }).click();
    await page.getByText('Intake Requests').waitFor({ timeout: 15000 });
    await page.getByText(/highlights/i).first().waitFor({ timeout: 15000 });
    await page.screenshot({ path: path.join(outDir, 'phase8-admin-requests.png'), fullPage: true });
    console.log(`OK: customer submit -> admin review smoke passed; screenshots in ${outDir}`);
  } finally {
    await browser.close();
  }
}

smokeAdminReview().catch((err) => {
  console.error(err);
  process.exit(1);
});
