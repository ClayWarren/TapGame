import { vi } from "vitest";

type LatestPostResult = { name: string } | null;

type UseSuspenseQueryFn = () => [LatestPostResult];

type MutationOptions = {
	onSuccess?: (data: unknown, variables: unknown, context: unknown) => unknown;
	onError?: (error: unknown, variables: unknown, context: unknown) => unknown;
};

type UseMutationFn = (opts?: MutationOptions) => {
	isPending: boolean;
	mutateAsync: (input: unknown) => Promise<unknown>;
};

type Overrides = Partial<{
	useSuspenseQuery: UseSuspenseQueryFn;
	useMutation: UseMutationFn;
	mutateAsync: (input: unknown) => Promise<unknown>;
	isPending: boolean;
	invalidate: () => Promise<void>;
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
				((opts?: MutationOptions) => {
					const mutateAsync =
						overrides.mutateAsync ||
						vi.fn<(input: unknown) => Promise<unknown>>(async () => undefined);

					return {
						isPending: overrides.isPending ?? false,
						mutateAsync: async (input: unknown) => {
							try {
								const result = await mutateAsync(input);
								await opts?.onSuccess?.(result, input, undefined);
								return result;
							} catch (err) {
								await opts?.onError?.(err, input, undefined);
								throw err;
							}
						},
					};
				}),
		},
	},
	useUtils: () => ({
		post: {
			invalidate:
				overrides.invalidate ||
				vi.fn<() => Promise<void>>(async () => undefined),
		},
	}),
});
