import { expect, test } from "@playwright/test"

test("semantic controls are visible", async ({ page }) => {
  await page.goto("/")
  await expect(page.getByRole("button", { name: "Auto" })).toBeVisible()
  await expect(page.getByRole("button", { name: "Manual" })).toBeVisible()
})
