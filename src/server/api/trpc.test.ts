import type { PrismaClient } from "@prisma/client";
import type { TRPCDefaultErrorShape } from "@trpc/server";
import { TRPCError } from "@trpc/server";
import { TRPC_ERROR_CODES_BY_KEY } from "@trpc/server/rpc";
import { describe, expect, it, vi } from "vitest";
import { z } from "zod";

const { sessionMock, getSessionMock, dbMock } = vi.hoisted(() => ({
	sessionMock: {
		session: {
			id: "sess-1",
			createdAt: new Date(),
			updatedAt: new Date(),
			userId: "user-1",
			expiresAt: new Date(Date.now() + 3_600_000),
			token: "token",
			ipAddress: "127.0.0.1",
			userAgent: "vitest",
		},
		user: {
			id: "user-1",
			createdAt: new Date(),
			updatedAt: new Date(),
			email: "user@example.com",
			emailVerified: true,
			name: "User",
			image: null,
		},
	},
	getSessionMock: vi.fn(),
	dbMock: { mocked: true } as unknown as PrismaClient,
}));

vi.mock("@/server/better-auth", () => ({
	auth: {
		api: {
			getSession: getSessionMock,
		},
	},
}));

vi.mock("@/server/db", () => ({
	db: dbMock,
}));

import {
	createCallerFactory,
	createTRPCContext,
	createTRPCRouter,
	protectedProcedure,
	publicProcedure,
} from "./trpc";

const originalEnv = { ...process.env };

type RouterInstance = ReturnType<typeof createTRPCRouter>;
type ErrorFormatter = NonNullable<
	RouterInstance["_def"]["_config"]["errorFormatter"]
>;

afterEach(() => {
	process.env = { ...originalEnv };
	vi.resetModules();
	vi.restoreAllMocks();
});

describe("trpc utilities", () => {
	it("createTRPCContext fetches session and includes db", async () => {
		getSessionMock.mockResolvedValue(sessionMock);

		const headers = new Headers([["x-test", "1"]]);
		const ctx = await createTRPCContext({ headers });

		expect(getSessionMock).toHaveBeenCalledWith({ headers });
		expect(ctx.session).toEqual(sessionMock);
		expect(ctx.db).toBe(dbMock);
	});

	it("protectedProcedure rejects when session is missing", async () => {
		const router = createTRPCRouter({
			secret: protectedProcedure.query(() => "top-secret"),
		});

		const createCaller = createCallerFactory(router);
		const caller = createCaller({
			db: dbMock,
			headers: new Headers(),
			session: null,
		});

		await expect(caller.secret()).rejects.toBeInstanceOf(TRPCError);
	});

	it("errorFormatter attaches zodError details", () => {
		const router = createTRPCRouter({});
		const formatter = (router as RouterInstance)._def._config.errorFormatter as
			| ErrorFormatter
			| undefined;

		if (!formatter) {
			throw new Error("missing formatter");
		}

		const zodError = new z.ZodError([]);
		const error = new TRPCError({ code: "BAD_REQUEST" });
		(error as TRPCError & { cause?: unknown }).cause = zodError;

		const shape: TRPCDefaultErrorShape = {
			message: "error",
			code: TRPC_ERROR_CODES_BY_KEY.BAD_REQUEST,
			data: { code: "BAD_REQUEST", httpStatus: 400 },
		};

		const args: Parameters<ErrorFormatter>[0] = {
			shape,
			error,
			type: "query",
			path: undefined,
			input: undefined,
			ctx: { headers: new Headers(), db: dbMock, session: sessionMock },
		};

		const formatted = formatter(args);

		expect(formatted.data?.zodError).toBeTruthy();
	});

	it("timing middleware logs duration in dev", async () => {
		const router = createTRPCRouter({
			ping: publicProcedure.query(() => "pong"),
		});

		const createCaller = createCallerFactory(router);
		const caller = createCaller({
			db: dbMock,
			headers: new Headers(),
			session: sessionMock,
		});

		const debugSpy = vi.spyOn(console, "debug").mockImplementation(() => {});
		process.env["TRPC_TIMING_LOG"] = "true";

		await caller.ping();

		expect(debugSpy).toHaveBeenCalled();
		debugSpy.mockRestore();
	});

	it("timing middleware skips log when TRPC_TIMING_LOG is false in dev", async () => {
		process.env["TRPC_TIMING_LOG"] = "false";

		const router = createTRPCRouter({
			ping: publicProcedure.query(() => "pong"),
		});

		const createCaller = createCallerFactory(router);
		const caller = createCaller({
			db: dbMock,
			headers: new Headers(),
			session: sessionMock,
		});

		const debugSpy = vi.spyOn(console, "debug").mockImplementation(() => {});
		await caller.ping();
		expect(debugSpy).not.toHaveBeenCalled();
		debugSpy.mockRestore();
	});

	it("timing middleware falls back to no-op in production", async () => {
		vi.stubEnv("NODE_ENV", "production");
		process.env["TRPC_TIMING_LOG"] = "false";
		vi.resetModules();

		vi.doMock("@/server/better-auth", () => ({
			auth: {
				api: {
					getSession: vi.fn().mockResolvedValue(sessionMock),
				},
			},
		}));
		vi.doMock("@/server/db", () => ({
			db: dbMock,
		}));

		const {
			createTRPCRouter: createRouterProd,
			createCallerFactory: createCallerProd,
			publicProcedure: publicProcedureProd,
		} = await import("./trpc");

		const router = createRouterProd({
			ping: publicProcedureProd.query(() => "pong"),
		});

		const caller = createCallerProd(router)({
			db: dbMock,
			headers: new Headers(),
			session: sessionMock,
		});

		const debugSpy = vi.spyOn(console, "debug").mockImplementation(() => {});
		const res = await caller.ping();
		expect(res).toBe("pong");
		expect(debugSpy).not.toHaveBeenCalled();
		debugSpy.mockRestore();
	});

	it("errorFormatter returns null zodError when cause is not ZodError", () => {
		const router = createTRPCRouter({});
		const formatter = (router as RouterInstance)._def._config.errorFormatter as
			| ErrorFormatter
			| undefined;

		const error = new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
		const shape: TRPCDefaultErrorShape = {
			message: "error",
			code: TRPC_ERROR_CODES_BY_KEY.INTERNAL_SERVER_ERROR,
			data: { code: "INTERNAL_SERVER_ERROR", httpStatus: 500 },
		};

		if (!formatter) {
			throw new Error("missing formatter");
		}

		const args: Parameters<ErrorFormatter>[0] = {
			shape,
			error,
			type: "query",
			path: undefined,
			input: undefined,
			ctx: { headers: new Headers(), db: dbMock, session: sessionMock },
		};

		const formatted = formatter(args);
		expect(formatted.data?.zodError).toBeNull();
	});
});
