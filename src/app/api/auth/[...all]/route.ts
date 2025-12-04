import { toNextJsHandler } from "better-auth/next-js";

import { auth } from "@/server/better-auth";

export const { GET, POST } = toNextJsHandler(auth.handler);

// Touch this if you change auth routing (custom endpoints/methods) or need to wrap handlers with
// middleware (logging, rate limiting). Otherwise this just forwards to Better Auth.
