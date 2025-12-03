import { defineConfig } from "@prisma/config";
import { env } from "@/env";

export default defineConfig({
	schema: "./prisma/schema.prisma",
	datasource: {
		url: env.DATABASE_URL,
	},
});
