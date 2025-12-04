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
	it("submits using createPost.mutateAsync", () => {
		const mutateAsyncMock = vi.fn().mockResolvedValue(undefined);

		mockApi = createTRPCReactMock({
			useSuspenseQuery: () => [{ name: "Hello" }],
			useMutation: () => ({
				isPending: false,
				mutateAsync: mutateAsyncMock,
			}),
		});

		render(<LatestPost />);

		fireEvent.change(screen.getByPlaceholderText("Title"), {
			target: { value: "Hello world" },
		});

		fireEvent.click(screen.getByText("Submit"));

		expect(mutateAsyncMock).toHaveBeenCalledWith({ name: "Hello world" });
	});

	it('shows "Submitting..." when mutation is pending', () => {
		mockApi = createTRPCReactMock({
			useSuspenseQuery: () => [{ name: "X" }],
			useMutation: () => ({
				isPending: true,
				mutateAsync: vi.fn(),
			}),
		});

		render(<LatestPost />);

		expect(screen.getByText("Submitting...")).toBeInTheDocument();
	});

	it("shows validation error when title is blank", async () => {
		const mutateAsyncMock = vi.fn();
		mockApi = createTRPCReactMock({
			useSuspenseQuery: () => [null],
			useMutation: () => ({
				isPending: false,
				mutateAsync: mutateAsyncMock,
			}),
		});

		render(<LatestPost />);

		const form = screen.getByText("Submit").closest("form");
		if (!form) throw new Error("form not found");
		fireEvent.submit(form);

		expect(screen.getByText("Title is required")).toBeInTheDocument();
		expect(mutateAsyncMock).not.toHaveBeenCalled();
	});

	it("displays server error message from mutation failure", async () => {
		mockApi = createTRPCReactMock({
			useSuspenseQuery: () => [null],
			useMutation: (opts) => ({
				isPending: false,
				mutateAsync: async () => {
					const err = new Error("boom");
					opts?.onError?.(err, undefined, undefined);
					throw err;
				},
			}),
		});

		render(<LatestPost />);

		fireEvent.change(screen.getByPlaceholderText("Title"), {
			target: { value: "Test" },
		});
		const form = screen.getByText("Submit").closest("form");
		if (!form) throw new Error("form not found");
		fireEvent.submit(form);

		await waitFor(() => {
			expect(screen.getByText("boom")).toBeInTheDocument();
		});
	});

	it("clears input and invalidates cache on success", async () => {
		const mutateAsyncMock = vi.fn().mockResolvedValue(undefined);
		const invalidateMock = vi.fn().mockResolvedValue(undefined);

		mockApi = createTRPCReactMock({
			useSuspenseQuery: () => [null],
			mutateAsync: mutateAsyncMock,
			invalidate: invalidateMock,
		});

		render(<LatestPost />);

		const input = screen.getByPlaceholderText("Title") as HTMLInputElement;

		fireEvent.change(input, { target: { value: "New post" } });
		fireEvent.click(screen.getByText("Submit"));

		await waitFor(() => {
			expect(invalidateMock).toHaveBeenCalled();
			expect(input.value).toBe("");
		});

		expect(screen.queryByText("Title is required")).not.toBeInTheDocument();
	});
});
