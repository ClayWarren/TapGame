import type { PrismaClient } from "../../../prisma/generated/client";

export async function createPostForUser(
	db: PrismaClient,
	params: {
		userId: string;
		name: string;
	},
) {
	return db.post.create({
		data: {
			name: params.name,
			createdBy: { connect: { id: params.userId } },
		},
	});
}

export async function getLatestPostForUser(db: PrismaClient, userId: string) {
	return db.post.findFirst({
		orderBy: { createdAt: "desc" },
		where: { createdBy: { id: userId } },
	});
}

// Touch this repository when you add more post queries/mutations (list, update, delete, search)
// or when you need to enforce business rules at the data layer (ownership checks, limits).
