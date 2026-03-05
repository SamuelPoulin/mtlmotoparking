import { defineConfig } from "@playwright/test";

import { loadEnvConfig } from "@next/env";
const projectDir = process.cwd();
loadEnvConfig(projectDir);

export default defineConfig({
  testDir: "./tests",
  outputDir: "./tests/test-results",
  globalTeardown: "./tests/setup/global-teardown.ts",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ["list"],
    ["github"],
    ["html", { outputFolder: "tests/playwright-report" }],
  ],
  use: {
    trace: "on-first-retry",
    baseURL: "http://localhost:3000",
  },

  projects: [
    {
      name: "setup",
      testDir: "tests/setup",
      testMatch: /.*\.setup\.ts/,
    },
    {
      name: "admin",
      testDir: "tests/admin",
      use: { storageState: "tests/.auth/admin.json" },
      dependencies: ["setup"],
    },
    {
      name: "user",
      testDir: "tests/user",
      use: { storageState: "tests/.auth/user.json" },
      dependencies: ["setup"],
    },
    {
      name: "guest",
      testDir: "tests/guest",
    },
  ],

  webServer: {
    command: "bun run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
  },
});
