import type { Page } from "@playwright/test";

export async function stabilizeVisualPage(page: Page): Promise<void> {
  await page.emulateMedia({ reducedMotion: "reduce", colorScheme: "light" });
  await page.addStyleTag({
    content:
      "*,*::before,*::after{animation:none !important;transition:none !important;caret-color:transparent !important;}",
  });
  await page.evaluate(async () => {
    await document.fonts.ready;
  });
}

export async function openWorkspace(page: Page): Promise<void> {
  await page.goto("/");
  await stabilizeVisualPage(page);
}
