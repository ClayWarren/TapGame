import {
	defaultShouldDehydrateQuery,
	QueryClient,
} from "@tanstack/react-query";
import SuperJSON from "superjson";

export const createQueryClient = () =>
	new QueryClient({
		defaultOptions: {
			queries: {
				staleTime: 30 * 1000,
			},
			dehydrate: {
				serializeData: SuperJSON.serialize,
				shouldDehydrateQuery: (query) =>
					defaultShouldDehydrateQuery(query) ||
					query.state.status === "pending",
			},
			hydrate: {
				deserializeData: SuperJSON.deserialize,
			},
		},
	});

// Future expansion (React Query):
// - Tune caching per feature via `queryCache`/`mutationCache` or route-level `staleTime`/`gcTime`.
// - Add global retry/backoff or disable retries for mutations that must not repeat.
// - Add suspense/streaming defaults if you adopt React suspense for data fetching.
// - Hook into query/mutation observers for analytics or logging of API performance.
