// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { createTRPCReactMock } from "../../../test/__mocks__/trpcReactMock";
import { LatestPost } from "./post";

// Create a mutable reference we can override per-test
let mockApi: ReturnType<typeof createTRPCReactMock>;

// Vitest mock that always returns our mockApi reference
vi.mock("@/trpc/react", () => ({
	get api() {
		return mockApi;
	},
}));

describe("LatestPost component", () => {
	it("renders latest post when available", () => {
		mockApi = createTRPCReactMock({
			useSuspenseQuery: () => [{ name: "X" }],
			useMutation: () => ({
				isPending: true,
				mutateAsync: vi.fn(),
			}),
		});

		render(<LatestPost />);

		expect(screen.getByText("Score: X")).toBeInTheDocument();
	});

	it("shows empty state when there are no posts", () => {
		mockApi = createTRPCReactMock({
			useSuspenseQuery: () => [null],
			useMutation: () => ({
				isPending: false,
				mutateAsync: vi.fn(),
			}),
		});

		render(<LatestPost />);

		expect(screen.getByText("You have no posts yet.")).toBeInTheDocument();
	});

	it('shows "Submitting..." when mutation is pending', () => {
		mockApi = createTRPCReactMock({
			useSuspenseQuery: () => [{ name: "Y" }],
			useMutation: () => ({
				isPending: true,
				mutateAsync: vi.fn(),
			}),
		});

		render(<LatestPost />);

		expect(screen.getByText("Submitting...")).toBeInTheDocument();
	});

	it('shows "Tap Me!" when mutation is idle', () => {
		mockApi = createTRPCReactMock({
			useSuspenseQuery: () => [{ name: "Z" }],
			useMutation: () => ({
				isPending: false,
				mutateAsync: vi.fn(),
			}),
		});

		render(<LatestPost />);

		expect(
			screen.getByRole("button", { name: /tap me!/i }),
		).toBeInTheDocument();
	});
});
