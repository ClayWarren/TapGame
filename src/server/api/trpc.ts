/**
 * YOU PROBABLY DON'T NEED TO EDIT THIS FILE, UNLESS:
 * 1. You want to modify request context.
 * 2. You want to create a new middleware or type of procedure.
 */

import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { treeifyError, ZodError } from "zod";

import { auth } from "@/server/better-auth";
import { db } from "@/server/db";

export const createTRPCContext = async (opts: { headers: Headers }) => {
	const session = await auth.api.getSession({
		headers: opts.headers,
	});
	return {
		db,
		session,
		...opts,
	};
};

const t = initTRPC.context<typeof createTRPCContext>().create({
	transformer: superjson,
	errorFormatter({ shape, error }) {
		return {
			...shape,
			data: {
				...shape.data,
				zodError:
					error.cause instanceof ZodError ? treeifyError(error.cause) : null,
			},
		};
	},
});

export const createCallerFactory = t.createCallerFactory;

export const createTRPCRouter = t.router;

/**
 * Future expansion guide:
 * - Add global middleware (logging, rate limiting, RBAC) with `t.middleware(...)` and apply via
 *   `.use()` on routers/procedures.
 * - For custom error shapes/messages, extend `errorFormatter` above or map TRPCError codes to
 *   user-facing strings in a link on the client.
 * - Real-time needs? Create a websocket router with `@trpc/server/adapters/ws` and expose it
 *   alongside the HTTP handler.
 * - Per-route meta (e.g., cache tags, analytics) can be set via `.meta({ ... })` on procedures.
 */
const timingMiddleware = t._config.isDev
	? t.middleware(async ({ next, path }) => {
			const start = Date.now();

			const waitMs = Math.floor(Math.random() * 400) + 100;
			await new Promise((resolve) => setTimeout(resolve, waitMs));

			const result = await next();

			const end = Date.now();
			if (process.env.TRPC_TIMING_LOG !== "false") {
				console.debug(`[TRPC] ${path} took ${end - start}ms`);
			}

			return result;
		})
	: t.middleware(({ next }) => next());

export const publicProcedure = t.procedure.use(timingMiddleware);

export const protectedProcedure = t.procedure
	.use(timingMiddleware)
	.use(({ ctx, next }) => {
		if (!ctx.session?.user) {
			throw new TRPCError({ code: "UNAUTHORIZED" });
		}
		return next({
			ctx: {
				session: { ...ctx.session, user: ctx.session.user },
			},
		});
	});
