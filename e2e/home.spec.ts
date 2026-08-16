import { test, expect } from "@playwright/test";

test("home page renders product title", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "创建、发布并分享一份专业在线简历" }),
  ).toBeVisible();
});
