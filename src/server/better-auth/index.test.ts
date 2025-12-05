import { describe, expect, it, vi } from "vitest";

// Mock the underlying config module so we can assert re-exports without touching real auth setup
vi.mock("@/server/better-auth/config", () => {
	const auth = { signIn: vi.fn(), signOut: vi.fn() };
	return { auth };
});

describe("better-auth index re-exports", () => {
	it("re-exports auth from config", async () => {
		const { auth } = await import("@/server/better-auth");
		const { auth: mockedAuth } = await import("@/server/better-auth/config");

		expect(auth).toBe(mockedAuth);
	});
});
