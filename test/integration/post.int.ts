import type { PrismaClient } from "@prisma/client";
import { describe, expect, it } from "vitest";

describe("post repository integration", () => {
	it("creates and fetches latest post for a user", async () => {
		const prisma = createInMemoryPrisma();

		const userId = "user-123";

		await prisma.user.create({
			data: {
				id: userId,
				name: "Test User",
				email: "user@example.com",
			},
		});

		const { createPostForUser, getLatestPostForUser } = await import(
			"@/server/repositories/post"
		);

		await createPostForUser(prisma, {
			name: "First post",
			userId,
		});

		// Slightly later post to verify ordering by createdAt desc
		await prisma.post.create({
			data: {
				id: "post-2",
				name: "Second post",
				createdById: userId,
				createdAt: new Date(Date.now() + 1000),
			},
		});

		const latest = await getLatestPostForUser(prisma, userId);

		expect(latest?.name).toBe("Second post");
	});
});

function createInMemoryPrisma() {
	type User = { id: string; name: string; email: string };
	type Post = {
		id: string;
		name: string;
		createdById: string;
		createdAt: Date;
	};

	const users: User[] = [];
	const posts: Post[] = [];

	const prisma = {
		user: {
			create: async ({ data }: { data: User }) => {
				users.push(data);
				return data;
			},
		},
		post: {
			create: async ({
				data,
			}: {
				data: Omit<Post, "createdAt"> & { createdAt?: Date };
			}) => {
				const record: Post = {
					createdAt: data.createdAt ?? new Date(),
					...data,
				};
				posts.push(record);
				return record;
			},
			findFirst: async ({
				where,
				orderBy,
			}: {
				where: { createdBy?: { id: string } };
				orderBy: { createdAt: "desc" | "asc" };
			}) => {
				const userId = where.createdBy?.id;
				const filtered = posts
					.filter((p) => (userId ? p.createdById === userId : true))
					.sort((a, b) =>
						orderBy.createdAt === "desc"
							? b.createdAt.getTime() - a.createdAt.getTime()
							: a.createdAt.getTime() - b.createdAt.getTime(),
					);
				return filtered[0] ?? null;
			},
		},
	} as unknown as PrismaClient;

	return prisma;
}
