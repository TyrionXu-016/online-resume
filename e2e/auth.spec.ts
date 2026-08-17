import { test, expect } from "@playwright/test";

test("unauthenticated dashboard visitors are sent to login", async ({ page }) => {
  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/login/);
  await expect(page.getByRole("heading", { name: "登录" })).toBeVisible();
  await expect(page.getByLabel("邮箱")).toBeVisible();
  await expect(page.getByLabel("密码")).toBeVisible();
});

test("login page renders email and password fields", async ({ page }) => {
  await page.goto("/login");
  await expect(page.getByRole("heading", { name: "登录" })).toBeVisible();
  await expect(page.getByRole("button", { name: "登录" })).toBeVisible();
});
