#!/usr/bin/env node

import { chromium } from "playwright";

const webBaseUrl = process.env.WEB_BASE_URL ?? "http://127.0.0.1:5175";
const backendBaseUrl = process.env.BACKEND_BASE_URL ?? "http://127.0.0.1:8080";
const keycloakUsername = process.env.KEYCLOAK_USERNAME ?? "alice";
const keycloakPassword = process.env.KEYCLOAK_PASSWORD ?? "secret";

const repoRoot = "/home/manuel/workspaces/2026-03-19/hair-signup/hair-booking";
const frontPhoto = `${repoRoot}/web/node_modules/@storybook/icons/dist/public/cover.jpg`;
const backPhoto = `${repoRoot}/web/node_modules/@storybook/icons/dist/public/logo.png`;
const hairlinePhoto = `${repoRoot}/web/node_modules/polished/docs/assets/meta.png`;
const inspoPhoto = `${repoRoot}/web/node_modules/@storybook/core/assets/docs/message-reference.png`;

async function runBookingSmoke(page) {
  await page.goto(`${webBaseUrl}/?app=booking`);

  await page.getByRole("button", { name: /I Want Extensions/i }).click();
  await page.getByRole("combobox").first().selectOption("Past shoulders");
  await page.getByRole("radio", { name: "Medium" }).click();
  await page.getByRole("radio", { name: "Wavy" }).click();
  await page.getByRole("combobox").nth(1).selectOption("No, never");
  await page.getByRole("button", { name: "Next" }).click();

  await page.locator('input[type="file"]').nth(0).setInputFiles(frontPhoto);
  await page.locator('input[type="file"]').nth(1).setInputFiles(backPhoto);
  await page.locator('input[type="file"]').nth(2).setInputFiles(hairlinePhoto);
  await page.locator('input[type="file"]').nth(3).setInputFiles(inspoPhoto);
  await page.getByRole("button", { name: "Next" }).click();

  await page.getByRole("button", { name: /Tape-ins/i }).click();
  await page.getByRole("combobox").selectOption("$800 – $1,200");
  await page.getByRole("radio", { name: "Every 4–6 weeks (ideal)" }).click();
  await page.getByRole("button", { name: /See My Estimate/i }).click();

  await page.getByRole("button", { name: /Book Free Consult/i }).click();
  await page.getByText("19", { exact: true }).click();
  await page.getByRole("button", { name: "9:00 AM" }).click();

  await page.getByRole("textbox", { name: "First & last name" }).fill("Alice Example");
  await page.getByRole("textbox", { name: "your@email.com" }).fill("alice@example.com");
  await page.getByRole("textbox", { name: "(401) 555-0123" }).fill("401-555-0123");
  await page.getByRole("button", { name: "Confirm Booking" }).click();

  await page.waitForSelector("text=You're All Set");

  return {
    confirmation: await page.locator("body").innerText(),
  };
}

async function runPortalAuthSmoke(page) {
  await page.goto(`${webBaseUrl}/?app=portal`);
  await page.getByRole("button", { name: "Continue to Sign In" }).click();

  await page.getByRole("textbox", { name: "Username or email" }).fill(keycloakUsername);
  await page.getByRole("textbox", { name: "Password" }).fill(keycloakPassword);
  await page.getByRole("button", { name: "Sign In" }).click();

  // Keycloak redirects to the backend host after callback; navigate back to Vite
  // to prove the browser session is honored there as well.
  await page.goto(`${webBaseUrl}/?app=portal`);
  const meResponse = await page.evaluate(async () => {
    const res = await fetch("/api/me", { credentials: "include" });
    return { status: res.status, body: await res.json() };
  });

  return {
    meResponse,
    portalBody: await page.locator("body").innerText(),
  };
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    const booking = await runBookingSmoke(page);
    const portal = await runPortalAuthSmoke(page);

    console.log(JSON.stringify({
      webBaseUrl,
      backendBaseUrl,
      booking,
      portal,
    }, null, 2));
  } finally {
    await browser.close();
  }
}

await main();
