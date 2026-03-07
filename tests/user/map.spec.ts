import { test, expect } from "@playwright/test";

import { USER_EMAIL } from "../setup/auth-test-utils";

test("loads map page", async ({ page }) => {
  await page.goto("/en/map");

  await expect(
    page.getByRole("button", { name: "Search an address" }),
  ).toBeVisible();

  await page.getByRole("button", { name: "Toggle menu" }).click();

  await expect(page.getByRole("dialog")).toBeVisible();

  await expect(page.getByText("E2E User")).toBeVisible({ timeout: 15000 });
  await expect(page.getByText(USER_EMAIL)).toBeVisible({
    timeout: 15000,
  });
});
