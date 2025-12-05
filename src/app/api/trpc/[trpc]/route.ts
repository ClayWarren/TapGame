import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import type { NextRequest } from "next/server";

import { env } from "@/env";
import { appRouter } from "@/server/api/root";
import { createTRPCContext } from "@/server/api/trpc";

const createContext = async (req: NextRequest) => {
	return createTRPCContext({
		headers: req.headers,
	});
};

const handler = (req: NextRequest) => {
	const options = {
		endpoint: "/api/trpc",
		req,
		router: appRouter,
		createContext: () => createContext(req),
	};

	if (env.NODE_ENV === "development") {
		return fetchRequestHandler({
			...options,
			onError: ({ path, error }) => {
				console.error(
					`❌ tRPC failed on ${path ?? "<no-path>"}: ${error.message}`,
				);
			},
		});
	}

	return fetchRequestHandler(options);
};

export { handler as GET, handler as POST };

// Touch this if you change the tRPC endpoint path, need custom error handling/logging,
// want to inject extra context per request (headers, locale, tenant), or add middleware.
