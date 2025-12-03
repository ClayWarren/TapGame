import type { PrismaClient } from "@prisma/client";
import { describe, expect, it, vi } from "vitest";
import { postRouter } from "./post";

/* ----------------------------------------------------
 * BetterAuth Session Mock (Correct Shape)
 * ---------------------------------------------------- */

type BetterAuthSession = {
	session: {
		id: string;
		createdAt: Date;
		updatedAt: Date;
		userId: string;
		expiresAt: Date;
		token: string;
		ipAddress?: string | null;
		userAgent?: string | null;
	};
	user: {
		id: string;
		createdAt: Date;
		updatedAt: Date;
		email: string;
		emailVerified: boolean;
		name: string;
		image?: string | null;
	};
};

/* ----------------------------------------------------
 * Prisma Mock — satisfy PrismaClient interface
 * ---------------------------------------------------- */

type MockedFn = ReturnType<typeof vi.fn>;

type MockedPrisma = PrismaClient & {
	post: {
		create: MockedFn;
		findFirst: MockedFn;
	};
};

function createMockPrisma(): MockedPrisma {
	return {
		$use: vi.fn(),
		$on: vi.fn(),
		$connect: vi.fn(),
		$disconnect: vi.fn(),
		$executeRaw: vi.fn(),
		$executeRawUnsafe: vi.fn(),
		$queryRaw: vi.fn(),
		$queryRawUnsafe: vi.fn(),
		$transaction: vi.fn(),

		post: {
			create: vi.fn(),
			findFirst: vi.fn(),
		},
	} as unknown as MockedPrisma;
}

/* ----------------------------------------------------
 * Context Type
 * ---------------------------------------------------- */

type MockCtx = {
	headers: Headers;
	db: MockedPrisma;
	session: BetterAuthSession | null;
};

/* ----------------------------------------------------
 * Context Factory
 * ---------------------------------------------------- */

function createMockSession(userId = "user123"): BetterAuthSession {
	const now = new Date();

	return {
		session: {
			id: "sess-abc",
			createdAt: now,
			updatedAt: now,
			userId,
			expiresAt: new Date(Date.now() + 3600 * 1000),
			token: "fake-token",
			ipAddress: "127.0.0.1",
			userAgent: "Vitest",
		},
		user: {
			id: userId,
			createdAt: now,
			updatedAt: now,
			email: "user@example.com",
			emailVerified: true,
			name: "Test User",
			image: null,
		},
	};
}

function createMockCtx(
	overrides?: Partial<MockCtx>,
	withSession = true,
): MockCtx {
	return {
		headers: new Headers(),
		db: createMockPrisma(),
		session: withSession ? createMockSession() : null,
		...overrides,
	};
}

function caller(ctx: MockCtx) {
	return postRouter.createCaller(ctx);
}

/* ----------------------------------------------------
 * Tests
 * ---------------------------------------------------- */

describe("postRouter", () => {
	it("hello returns a greeting", async () => {
		const c = caller(createMockCtx());
		const res = await c.hello({ text: "World" });
		expect(res).toEqual({ greeting: "Hello World" });
	});

	it("create creates a post tied to the user session", async () => {
		const ctx = createMockCtx();
		const c = caller(ctx);

		ctx.db.post.create.mockResolvedValue({
			id: "post123",
			name: "My Post",
			createdById: "user123",
			createdAt: new Date(),
		});

		const res = await c.create({ name: "My Post" });

		expect(ctx.db.post.create).toHaveBeenCalledWith({
			data: {
				name: "My Post",
				createdBy: { connect: { id: "user123" } },
			},
		});

		expect(res.id).toBe("post123");
	});

	it("getLatest returns null when no posts", async () => {
		const ctx = createMockCtx();
		const c = caller(ctx);

		ctx.db.post.findFirst.mockResolvedValue(null);

		const res = await c.getLatest();
		expect(res).toBeNull();
	});

	it("getLatest returns latest post when it exists", async () => {
		const post = {
			id: "p999",
			name: "Latest",
			createdById: "user123",
			createdAt: new Date(),
		};

		const ctx = createMockCtx();
		const c = caller(ctx);

		ctx.db.post.findFirst.mockResolvedValue(post);

		const res = await c.getLatest();

		expect(res).toEqual(post);
	});

	it("getSecretMessage returns correct string", async () => {
		const c = caller(createMockCtx());
		const res = await c.getSecretMessage();
		expect(res).toBe("you can now see this secret message!");
	});
});
