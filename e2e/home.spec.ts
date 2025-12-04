import { expect, test } from "@playwright/test";

import { analyzeAccessibility } from "./axe";

test.describe("home page", () => {
	test("shows hero content and sign-in action", async ({ page }) => {
		await page.goto("/");

		await expect(
			page.getByRole("heading", { level: 1, name: /Clay\s+Warren/i }),
		).toBeVisible();
		await expect(
			page.getByRole("link", { name: /First Steps/i }),
		).toBeVisible();
		await expect(
			page.getByRole("link", { name: /Documentation/i }),
		).toBeVisible();
		await expect(
			page.getByRole("button", { name: /sign in with github/i }),
		).toBeVisible();
	});

	test("has no obvious accessibility violations", async ({ page }) => {
		await page.goto("/");

		const results = await analyzeAccessibility(page);

		expect(results.violations).toEqual([]);
	});
});
