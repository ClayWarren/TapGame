// @vitest-environment jsdom

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { createTRPCReactMock } from "../../../test/__mocks__/trpcReactMock";
import { LatestPost } from "./post";

// Create a mutable reference we can override per-test
let mockApi: ReturnType<typeof createTRPCReactMock>;

beforeEach(() => {
	localStorage.clear();
});

// Vitest mock that always returns our mockApi reference
vi.mock("@/trpc/react", () => ({
	get api() {
		return mockApi;
	},
}));

describe("LatestPost component", () => {
	it("renders latest post when available", () => {
		mockApi = createTRPCReactMock({
			useQuery: () => ({ data: { name: "X" } }),
			useMutation: () => ({
				isPending: true,
				mutateAsync: vi.fn(),
			}),
		});

		render(<LatestPost isAuthenticated />);

		expect(screen.getByText("Score: X")).toBeInTheDocument();
	});

	it("shows empty state when there are no posts", () => {
		mockApi = createTRPCReactMock({
			useQuery: () => ({ data: null }),
			useMutation: () => ({
				isPending: false,
				mutateAsync: vi.fn(),
			}),
		});

		render(<LatestPost isAuthenticated />);

		expect(screen.getByText("You have no posts yet.")).toBeInTheDocument();
	});

	it("disables the button while submission is pending for authed users without changing label", () => {
		mockApi = createTRPCReactMock({
			useQuery: () => ({ data: { name: "Y" } }),
			useMutation: () => ({
				isPending: true,
				mutateAsync: vi.fn(),
			}),
		});

		render(<LatestPost isAuthenticated />);

		const button = screen.getByRole("button", { name: /tap me!/i });
		expect(button).toBeDisabled();
	});

	it('shows "Tap Me!" when mutation is idle', () => {
		mockApi = createTRPCReactMock({
			useQuery: () => ({ data: { name: "Z" } }),
			useMutation: () => ({
				isPending: false,
				mutateAsync: vi.fn(),
			}),
		});

		render(<LatestPost isAuthenticated />);

		expect(
			screen.getByRole("button", { name: /tap me!/i }),
		).toBeInTheDocument();
	});

	it("submits the next score and invalidates cache on success", async () => {
		const mutateAsync = vi.fn(async () => undefined);
		const invalidate = vi.fn(async () => undefined);

		mockApi = createTRPCReactMock({
			useQuery: () => ({ data: { name: "2" } }),
			mutateAsync,
			invalidate,
		});

		render(<LatestPost isAuthenticated />);

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
			useQuery: () => ({ data: { name: "4" } }),
			useMutation: (opts) => ({
				isPending: false,
				mutateAsync: async () => {
					opts?.onError?.(new Error("nope"), undefined, undefined);
				},
			}),
			invalidate,
		});

		render(<LatestPost isAuthenticated />);

		fireEvent.click(screen.getByRole("button", { name: /tap me!/i }));

		expect(await screen.findByText("nope")).toBeInTheDocument();
		expect(invalidate).not.toHaveBeenCalled();
	});

	it("falls back to default error message when error message is missing", async () => {
		mockApi = createTRPCReactMock({
			useQuery: () => ({ data: { name: "5" } }),
			useMutation: (opts) => ({
				isPending: false,
				mutateAsync: async () => {
					opts?.onError?.(new Error(), undefined, undefined);
				},
			}),
			invalidate: vi.fn(),
		});

		render(<LatestPost isAuthenticated />);

		fireEvent.click(screen.getByRole("button", { name: /tap me!/i }));

		expect(
			await screen.findByText(/failed to create post/i),
		).toBeInTheDocument();
	});

	it("prefers cached score from localStorage when present", () => {
		localStorage.setItem("score", "9");

		mockApi = createTRPCReactMock({
			useQuery: () => ({ data: { name: "2" } }),
			useMutation: () => ({
				isPending: false,
				mutateAsync: vi.fn(),
			}),
		});

		render(<LatestPost isAuthenticated />);

		expect(screen.getByText("Score: 9")).toBeInTheDocument();
	});

	it("starts at score 1 when there is no latest post", async () => {
		const mutateAsync = vi.fn(async () => undefined);

		mockApi = createTRPCReactMock({
			useQuery: () => ({ data: null }),
			mutateAsync,
		});

		render(<LatestPost isAuthenticated />);

		fireEvent.click(screen.getByRole("button", { name: /tap me!/i }));

		await waitFor(() =>
			expect(mutateAsync).toHaveBeenCalledWith({ name: "1" }),
		);
	});

	it("shows offline hint when user is not authenticated", () => {
		mockApi = createTRPCReactMock({
			useQuery: () => ({ data: null }),
			useMutation: () => ({
				isPending: false,
				mutateAsync: vi.fn(),
			}),
		});

		render(<LatestPost isAuthenticated={false} />);

		expect(
			screen.getByText(/playing offline — sign in anytime to sync your score/i),
		).toBeInTheDocument();
	});

	it("does not call mutation when unauthenticated submit occurs", () => {
		const mutateAsync = vi.fn();

		mockApi = createTRPCReactMock({
			useQuery: () => ({ data: { name: "3" } }),
			useMutation: () => ({
				isPending: false,
				mutateAsync,
			}),
		});

		render(<LatestPost isAuthenticated={false} />);

		fireEvent.click(screen.getByRole("button", { name: /tap me!/i }));

		expect(mutateAsync).not.toHaveBeenCalled();
	});
});
