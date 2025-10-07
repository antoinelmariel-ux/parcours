import { test, expect } from "@playwright/test";

test.describe("Flow canvas", () => {
  test("affiche la bibliothèque et le canvas", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "Bibliothèque" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Propriétés" })).toBeVisible();
    await expect(page.locator("#flow-canvas")).toBeVisible();
  });
});
