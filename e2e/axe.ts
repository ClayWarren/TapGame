import { AxeBuilder } from "@axe-core/playwright";
import type { Page } from "@playwright/test";

export const analyzeAccessibility = async (page: Page) =>
	new AxeBuilder({ page }).analyze();
