import { expect, test } from "@playwright/test";

test("home redirects to landing", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveURL(/\/landing$/);
  await expect(
    page.getByRole("heading", { name: /stop using spreadsheets to run your gym/i }),
  ).toBeVisible();
});

test("landing exposes core CTAs", async ({ page }) => {
  await page.goto("/landing");

  await expect(page.getByRole("button", { name: /sign in/i }).first()).toBeVisible();
  await expect(page.getByRole("button", { name: /join as member/i }).first()).toBeVisible();
  await expect(page.getByRole("button", { name: /register your gym/i }).first()).toBeVisible();
  await expect(page.getByPlaceholder(/search by gym name or code/i)).toBeVisible();
});
