import { afterEach, describe, expect, it, vi } from "vitest";

const originalEnv = { ...process.env };

afterEach(() => {
	process.env = { ...originalEnv };
	vi.unstubAllEnvs();
	vi.resetModules();
});

describe("env config", () => {
	it("requires BETTER_AUTH_SECRET in production", async () => {
		vi.stubEnv("NODE_ENV", "production");
		process.env.BETTER_AUTH_GITHUB_CLIENT_ID = "id";
		process.env.BETTER_AUTH_GITHUB_CLIENT_SECRET = "secret";
		process.env.DATABASE_URL = "https://example.com";
		process.env.APP_URL = "https://app.example.com";
		delete process.env.BETTER_AUTH_SECRET;

		await expect(import("./env.js")).rejects.toThrow();
	});

	it("loads successfully when required env vars are present in production", async () => {
		vi.stubEnv("NODE_ENV", "production");
		process.env.BETTER_AUTH_SECRET = "super-secret";
		process.env.BETTER_AUTH_GITHUB_CLIENT_ID = "id";
		process.env.BETTER_AUTH_GITHUB_CLIENT_SECRET = "secret";
		process.env.DATABASE_URL = "https://example.com";
		process.env.APP_URL = "https://app.example.com";

		const { env } = await import("./env.js");

		expect(env.BETTER_AUTH_SECRET).toBe("super-secret");
	});
});
