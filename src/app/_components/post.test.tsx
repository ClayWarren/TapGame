// @vitest-environment jsdom

import { fireEvent, render, screen } from "@testing-library/react";
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
		const mutateAsyncMock = vi.fn();

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
});
