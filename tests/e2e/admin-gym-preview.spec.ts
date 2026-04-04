import { expect, test } from "@playwright/test";

const ADMIN_EMAIL = process.env.E2E_ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD;

test("admin can open gym landing page preview from gym profile", async ({ page, context }) => {
  test.skip(!ADMIN_EMAIL || !ADMIN_PASSWORD, "Set E2E_ADMIN_EMAIL and E2E_ADMIN_PASSWORD to run this test.");

  await page.goto("/login");
  await page.getByLabel(/email/i).fill(ADMIN_EMAIL!);
  await page.getByLabel(/password/i).fill(ADMIN_PASSWORD!);
  await page.getByRole("button", { name: /sign in/i }).click();

  await expect(page).toHaveURL(/\/admin$/);

  await page.goto("/admin/gym-profile");

  const previewLink = page.getByRole("link", {
    name: /preview as visitor|preview as admin/i,
  });
  await expect(previewLink).toBeVisible();

  const [previewPage] = await Promise.all([
    context.waitForEvent("page"),
    previewLink.click(),
  ]);

  await previewPage.waitForLoadState("domcontentloaded");

  await expect(previewPage).toHaveURL(/\/gym\//);
  await expect(previewPage.getByText(/coming soon\./i)).toHaveCount(0);
  await expect(
    previewPage.getByRole("button", { name: /create account|join/i }).first(),
  ).toBeVisible();
});
