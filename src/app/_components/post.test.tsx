// @vitest-environment jsdom

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
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

	it("submits the next score and invalidates cache on success", async () => {
		const mutateAsync = vi.fn(async () => undefined);
		const invalidate = vi.fn(async () => undefined);

		mockApi = createTRPCReactMock({
			useSuspenseQuery: () => [{ name: "2" }],
			mutateAsync,
			invalidate,
		});

		render(<LatestPost />);

		fireEvent.click(screen.getByRole("button", { name: /tap me!/i }));

		await waitFor(() =>
			expect(mutateAsync).toHaveBeenCalledWith({ name: "3" }),
		);
		expect(invalidate).toHaveBeenCalledTimes(1);
		expect(
			screen.queryByText(/failed to create post/i),
		).not.toBeInTheDocument();
	});

	it("shows error message when creation fails", async () => {
		const invalidate = vi.fn(async () => undefined);

		mockApi = createTRPCReactMock({
			useSuspenseQuery: () => [{ name: "4" }],
			useMutation: (opts) => ({
				isPending: false,
				mutateAsync: async () => {
					opts?.onError?.(new Error("nope"), undefined, undefined);
				},
			}),
			invalidate,
		});

		render(<LatestPost />);

		fireEvent.click(screen.getByRole("button", { name: /tap me!/i }));

		expect(await screen.findByText("nope")).toBeInTheDocument();
		expect(invalidate).not.toHaveBeenCalled();
	});

	it("starts at score 1 when there is no latest post", async () => {
		const mutateAsync = vi.fn(async () => undefined);

		mockApi = createTRPCReactMock({
			useSuspenseQuery: () => [null],
			mutateAsync,
		});

		render(<LatestPost />);

		fireEvent.click(screen.getByRole("button", { name: /tap me!/i }));

		await waitFor(() =>
			expect(mutateAsync).toHaveBeenCalledWith({ name: "1" }),
		);
	});
});
