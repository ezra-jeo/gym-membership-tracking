import { expect, test } from "@playwright/test";

test("home redirects to landing", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveURL(/\/landing$/);
  await expect(page.getByRole("heading", { name: /your gym\. your rules\./i })).toBeVisible();
});

test("landing exposes core CTAs", async ({ page }) => {
  await page.goto("/landing");

  // Hero CTA button (changed from "Try the Demo" to "Your Gym")
  await expect(page.getByRole("link", { name: /your gym/i })).toBeVisible();
  
  // Open the navigation menu to access Sign In and Create Account
  await page.getByRole("button", { name: /open menu/i }).click();
  await expect(page.getByRole("link", { name: /sign in/i }).first()).toBeVisible();
  await expect(page.getByRole("link", { name: /create account/i })).toBeVisible();
  
  // Close menu and check gym finder search
  await page.getByRole("button", { name: /close menu/i }).click();
  await expect(page.getByPlaceholder(/search by gym name or code/i)).toBeVisible();
});
