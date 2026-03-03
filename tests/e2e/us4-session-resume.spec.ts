import { expect, test } from "@playwright/test"

test("persistence status is visible", async ({ page }) => {
  await page.goto("/")
  await expect(page.getByText("Local persistence ready")).toBeVisible()
})
