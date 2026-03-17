import { expect, test } from "@playwright/test";

test("home redirects to landing", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveURL(/\/landing$/);
  await expect(page.getByRole("heading", { name: /your gym\. your rules\./i })).toBeVisible();
});

test("landing exposes core CTAs", async ({ page }) => {
  await page.goto("/landing");

  await expect(page.getByRole("link", { name: /try the demo/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /sign in/i }).first()).toBeVisible();
  await expect(page.getByRole("link", { name: /create account/i })).toBeVisible();
  await expect(page.getByPlaceholder(/search by gym name or code/i)).toBeVisible();
});
