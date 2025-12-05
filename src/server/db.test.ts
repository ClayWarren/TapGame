import {
	afterEach,
	beforeEach,
	describe,
	expect,
	it,
	type Mock,
	vi,
} from "vitest";

const globalForPrisma = globalThis as { prisma?: unknown };

type PrismaInstance = { $disconnect: Mock; opts?: unknown };

const mockPrismaFactory = () => {
	const prismaInstance: PrismaInstance = { $disconnect: vi.fn() };
	const PrismaClientMock = vi.fn(function PrismaClientMock(opts) {
		prismaInstance.opts = opts;
		return prismaInstance;
	});
	return { prismaInstance, PrismaClientMock };
};

const mockInfra = () => {
	const poolInstance = { kind: "pool" };
	const adapterInstance = { kind: "adapter" };

	const PoolMock = vi.fn(function PoolMock(_: unknown) {
		return poolInstance;
	});
	const PrismaPgMock = vi.fn(function PrismaPgMock(_: unknown) {
		return adapterInstance;
	});

	vi.doMock("pg", () => ({ Pool: PoolMock }));
	vi.doMock("@prisma/adapter-pg", () => ({ PrismaPg: PrismaPgMock }));

	return { poolInstance, adapterInstance };
};

const mockEnv = (nodeEnv: "development" | "test" | "production") => {
	vi.doMock("@/env", () => ({
		env: {
			DATABASE_URL: "postgres://example",
			NODE_ENV: nodeEnv,
		},
	}));
};

const loadDbModule = async () => import("./db");

describe("db singleton setup", () => {
	beforeEach(() => {
		vi.resetModules();
		vi.clearAllMocks();
		delete globalForPrisma.prisma;
	});

	afterEach(() => {
		delete globalForPrisma.prisma;
	});

	it("uses verbose Prisma logging in development and caches globally", async () => {
		const { prismaInstance, PrismaClientMock } = mockPrismaFactory();
		const { adapterInstance } = mockInfra();
		mockEnv("development");
		vi.doMock("../../prisma/generated/client", () => ({
			PrismaClient: PrismaClientMock,
		}));

		const { db } = await loadDbModule();

		expect(db).toBe(prismaInstance);
		expect(PrismaClientMock).toHaveBeenCalledWith({
			adapter: adapterInstance,
			log: ["query", "error", "warn"],
		});
		expect(globalForPrisma.prisma).toBe(prismaInstance);
	});

	it("uses minimal Prisma logging in production and avoids global caching", async () => {
		const { prismaInstance, PrismaClientMock } = mockPrismaFactory();
		const { adapterInstance } = mockInfra();
		mockEnv("production");
		vi.doMock("../../prisma/generated/client", () => ({
			PrismaClient: PrismaClientMock,
		}));

		const { db } = await loadDbModule();

		expect(db).toBe(prismaInstance);
		expect(PrismaClientMock).toHaveBeenCalledWith({
			adapter: adapterInstance,
			log: ["error"],
		});
		expect(globalForPrisma.prisma).toBeUndefined();
	});

	it("reuses existing global Prisma instance when present", async () => {
		const { PrismaClientMock } = mockPrismaFactory();
		mockInfra();
		mockEnv("development");
		vi.doMock("../../prisma/generated/client", () => ({
			PrismaClient: PrismaClientMock,
		}));
		const existing = { kind: "existing-prisma" };
		globalForPrisma.prisma = existing;

		const { db } = await loadDbModule();

		expect(db).toBe(existing);
		expect(PrismaClientMock).not.toHaveBeenCalled();
	});
});
