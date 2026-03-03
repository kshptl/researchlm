import { expect, test } from "@playwright/test"
import { openWorkspace, stabilizeVisualPage } from "./visual-test-helpers"

test.describe("US2 visual regression", () => {
  test("captures hierarchy and candidate lifecycle visuals", async ({ page }) => {
    await openWorkspace(page)

    await page.getByRole("button", { name: "Subtopic", exact: true }).click()
    await page.getByRole("button", { name: "Sibling", exact: true }).click()

    await expect(page.getByText("Generated subtopics")).toBeVisible()
    await expect(page.getByRole("button", { name: "Select" }).first()).toBeVisible()
    await stabilizeVisualPage(page)
    await expect(page).toHaveScreenshot("us2-vs005-vs006-hierarchy-candidates.png", { fullPage: true })
  })
})
