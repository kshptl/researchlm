import { expect, test } from "@playwright/test"
import { openWorkspace, stabilizeVisualPage } from "./visual-test-helpers"

test.describe("US3 visual regression", () => {
  test("captures semantic auto and manual keyword modes", async ({ page }) => {
    await openWorkspace(page)

    await page.getByRole("button", { name: "Manual" }).click()
    await page.getByRole("button", { name: "keywords" }).click()
    await expect(page.getByText("showing keywords")).toBeVisible()
    await stabilizeVisualPage(page)
    await expect(page).toHaveScreenshot("us3-vs008-manual-keywords.png", { fullPage: true })

    await page.getByRole("button", { name: "Auto" }).click()
    await page.getByRole("button", { name: "Zoom out" }).click()
    await page.getByRole("button", { name: "Zoom out" }).click()
    await stabilizeVisualPage(page)
    await expect(page).toHaveScreenshot("us3-vs007-auto-semantic.png", { fullPage: true })
  })
})
