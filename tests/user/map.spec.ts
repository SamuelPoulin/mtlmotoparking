import { test, expect } from "@playwright/test";

test("loads map page", async ({ page }) => {
  await page.goto("/en/map");

  await expect(
    page.getByRole("button", { name: "Search an address" }),
  ).toBeVisible();

  await page.getByRole("button", { name: "Toggle menu" }).click();

  await expect(page.getByRole("dialog")).toBeVisible();

  await expect(page.getByText("E2E User")).toBeVisible({ timeout: 15000 });
  await expect(page.getByText("e2e+user@mtlmotoparking.ca")).toBeVisible({
    timeout: 15000,
  });
});
