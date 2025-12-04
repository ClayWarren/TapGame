import { vi } from "vitest";

type LatestPostResult = { name: string } | null;

type UseSuspenseQueryFn = () => [LatestPostResult];

type UseMutationFn = () => {
	isPending: boolean;
	mutateAsync: (input: unknown) => Promise<void>;
};

type Overrides = Partial<{
	useSuspenseQuery: UseSuspenseQueryFn;
	useMutation: UseMutationFn;
}>;

export const createTRPCReactMock = (overrides: Overrides = {}) => ({
	post: {
		getLatest: {
			useSuspenseQuery:
				overrides.useSuspenseQuery || (() => [null as LatestPostResult]),
		},
		create: {
			useMutation:
				overrides.useMutation ||
				(() => ({
					isPending: false,
					mutateAsync: vi.fn<(input: unknown) => Promise<void>>(),
				})),
		},
	},
	useUtils: () => ({
		post: {
			invalidate: vi.fn<() => Promise<void>>(),
		},
	}),
});
