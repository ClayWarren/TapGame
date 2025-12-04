import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
	server: {
		BETTER_AUTH_SECRET:
			process.env.NODE_ENV === "production"
				? z.string()
				: z.string().optional(),
		BETTER_AUTH_GITHUB_CLIENT_ID: z.string(),
		BETTER_AUTH_GITHUB_CLIENT_SECRET: z.string(),
		DATABASE_URL: z.url(),
		APP_URL: z.url().default("http://localhost:3000"),
		NODE_ENV: z
			.enum(["development", "test", "production"])
			.default("development"),
	},

	client: {
		// NEXT_PUBLIC_CLIENTVAR: z.string(),
	},

	runtimeEnv: {
		BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
		BETTER_AUTH_GITHUB_CLIENT_ID: process.env.BETTER_AUTH_GITHUB_CLIENT_ID,
		BETTER_AUTH_GITHUB_CLIENT_SECRET:
			process.env.BETTER_AUTH_GITHUB_CLIENT_SECRET,
		DATABASE_URL: process.env.DATABASE_URL,
		APP_URL: process.env.APP_URL,
		NODE_ENV: process.env.NODE_ENV,
	},

	skipValidation: !!process.env.SKIP_ENV_VALIDATION,
	emptyStringAsUndefined: true,
});

// Future expansion (env + zod):
// - Add new server-only vars to `server` and mirror them in `runtimeEnv`.
// - To expose to the browser, add `NEXT_PUBLIC_*` keys in `client` and `runtimeEnv`.
// - Use richer Zod schemas (e.g., enums, regex, transforms) to validate formats like emails or ports.
// - Keep sensitive secrets out of `client`; only place them in `server`.
