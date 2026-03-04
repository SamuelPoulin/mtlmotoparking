import { test, expect } from "@playwright/test";

test("loads map page", async ({ page }) => {
  await page.goto("/en/map");

  await expect(
    page.getByRole("button", { name: "Search an address" }),
  ).toBeVisible();

  await page.getByRole("button", { name: "Toggle menu" }).click();

  await expect(
    page.getByRole("button", { name: "Sign In" }),
  ).toBeVisible();

  await expect(
    page.getByText(
      "Sign in to contribute to the community and share parking spot updates!",
    ),
  ).toBeVisible();
});
