import { expect, test } from "@playwright/test"

test("hierarchy panel is visible", async ({ page }) => {
  await page.goto("/")
  await expect(page.getByText("Hierarchy")).toBeVisible()
})
