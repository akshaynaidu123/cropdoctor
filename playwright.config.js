import { existsSync } from "node:fs";
import { defineConfig, devices } from "@playwright/test";

const installedBrowser =
  process.env.PLAYWRIGHT_EXECUTABLE_PATH ||
  [
    "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
    "C:/Program Files/Google/Chrome/Application/chrome.exe",
  ].find((path) => existsSync(path));

export default defineConfig({
  testDir: "./tests/browser",
  fullyParallel: false,
  workers: 1,
  timeout: 30_000,
  reporter: "list",
  use: {
    baseURL: "http://127.0.0.1:5175",
    launchOptions: installedBrowser ? { executablePath: installedBrowser } : {},
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["iPhone 13"], defaultBrowserType: "chromium" } },
  ],
  webServer: [
    {
      command: "node server/tests/browser-api.js",
      url: "http://127.0.0.1:5176/api/health",
      reuseExistingServer: false,
    },
    {
      command: "npm run dev:frontend -- --host 127.0.0.1 --port 5175",
      url: "http://127.0.0.1:5175",
      env: { API_PROXY_TARGET: "http://127.0.0.1:5176" },
      reuseExistingServer: false,
    },
  ],
});
