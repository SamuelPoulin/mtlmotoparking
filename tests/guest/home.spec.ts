import { test, expect } from "@playwright/test";

test("loads home page", async ({ page }) => {
  await page.goto("/en");

  await expect(
    page.getByRole("heading", { name: "mtlmotoparking" }),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "Open Map" })).toBeVisible();
});
