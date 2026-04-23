import { spawn } from "child_process";
import { existsSync, mkdirSync } from "fs";
import { join } from "path";
import { chromium } from "playwright";

const cwd = process.cwd();
const snapshotDir = join(cwd, "tmp", "ui-snapshots");
mkdirSync(snapshotDir, { recursive: true });

const config = await import("../src/3-utilities/app-config.js").then((m) => m.default);
const baseUrl = process.env.UI_BASE_URL || `http://localhost:${config.appPort}`;
const username = process.env.UI_USER || "admin";
const password = process.env.UI_PASSWORD || "admin";
const headless = process.env.UI_HEADLESS !== "0";

function findBrowserPath() {
  const candidates = [
    process.env.BROWSER_PATH,
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
    "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  ].filter(Boolean);

  return candidates.find((path) => existsSync(path));
}

async function waitForServer(url, timeoutMs = 15000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(`${url}/login.html`);
      if (res.ok) return;
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error(`Timed out waiting for ${url}`);
}

function startServerIfNeeded() {
  if (process.env.UI_BASE_URL) return null;

  const child = spawn(process.execPath, ["app.js"], {
    cwd,
    env: process.env,
    stdio: ["ignore", "pipe", "pipe"],
  });

  child.stdout.on("data", (data) => process.stdout.write(data));
  child.stderr.on("data", (data) => process.stderr.write(data));
  return child;
}

async function capturePage(page, name, width, height) {
  await page.setViewportSize({ width, height });
  await page.screenshot({
    path: join(snapshotDir, `${name}-${width}x${height}.png`),
    fullPage: true,
  });
}

const server = startServerIfNeeded();

try {
  await waitForServer(baseUrl);

  const executablePath = findBrowserPath();
  const browser = await chromium.launch({
    headless,
    executablePath,
  });

  const page = await browser.newPage();
  await page.goto(`${baseUrl}/login.html`, { waitUntil: "networkidle" });
  await capturePage(page, "login", 1440, 900);
  await capturePage(page, "login", 390, 844);

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.fill("#username", username);
  await page.fill("#password", password);
  await Promise.all([
    page.waitForURL(`${baseUrl}/**`, { timeout: 10000 }).catch(() => null),
    page.click("#btn-login"),
  ]);
  await page.waitForLoadState("networkidle");

  await capturePage(page, "after-login", 1440, 900);
  await capturePage(page, "after-login", 390, 844);

  for (const tab of ["employees", "projects", "stats"]) {
    const button = page.locator(`.nav-tab[data-tab="${tab}"]`);
    if (await button.count()) {
      await button.click();
      await page.waitForTimeout(300);
      await capturePage(page, `admin-${tab}`, 1440, 900);
      await capturePage(page, `admin-${tab}`, 390, 844);
    }
  }

  console.log(`UI screenshots saved to ${snapshotDir}`);
  await browser.close();
} finally {
  if (server) server.kill();
}
