import { vi } from "vitest";

type LatestPostResult = { name: string } | null;

type UseSuspenseQueryFn = () => [LatestPostResult];

type UseMutationFn = () => {
	isPending: boolean;
	mutate: (input: unknown) => void;
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
					mutate: vi.fn<(input: unknown) => void>(),
				})),
		},
	},
	useUtils: () => ({
		post: {
			invalidate: vi.fn<() => Promise<void>>(),
		},
	}),
});
