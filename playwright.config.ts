import { defineConfig, devices } from "@playwright/test";

import { loadEnvConfig } from "@next/env";
const projectDir = process.cwd();
loadEnvConfig(projectDir);

export default defineConfig({
  testDir: "./tests",
  outputDir: "./tests/test-results",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [["list"], ["github"]],
  use: {
    trace: "on-first-retry",
  },

  projects: [
    {
      name: "guest",
      testDir: "./tests/guest",
      dependencies: [],
    },
  ],

  webServer: {
    command: "bun run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
  },
});
