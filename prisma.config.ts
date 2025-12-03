import "dotenv/config";
import { defineConfig } from "@prisma/config";

export default defineConfig({
	schema: "./prisma/schema.prisma",
	datasource: {
		// Use raw env here so Prisma CLI works without path aliases/Next runtime.
		url: process.env.DATABASE_URL ?? "",
	},
});
