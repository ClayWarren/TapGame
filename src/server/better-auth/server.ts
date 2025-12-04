import { headers } from "next/headers";
import { cache } from "react";
import { auth } from ".";

export const getSession = cache(async () =>
	auth.api.getSession({ headers: await headers() }),
);

// Touch this if you need more server-side helpers (e.g., getUser, requireSession) or need to
// pass additional headers/context into Better Auth API calls.
