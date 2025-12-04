import type { PrismaClient } from "../../../generated/prisma";

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
