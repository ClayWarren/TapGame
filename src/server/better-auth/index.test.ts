import { describe, expect, it } from "vitest";

describe("better-auth index re-exports", () => {
	it("re-exports auth from config", async () => {
		const { auth } = await import("@/server/better-auth");
		const { auth: configAuth } = await import("@/server/better-auth/config");

		expect(auth).toBe(configAuth);
	});

	it("exposes getAuth helper that returns the same instance", async () => {
		const { getAuth } = await import("@/server/better-auth");
		const { auth: configAuth } = await import("@/server/better-auth/config");

		expect(getAuth()).toBe(configAuth);
	});
});
