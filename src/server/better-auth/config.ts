import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";

import { env } from "@/env";
import { db } from "@/server/db";

export const auth = betterAuth({
	database: prismaAdapter(db, {
		provider: "postgresql", // or "sqlite" or "mysql"
	}),
	account: {
		// Keep strict in production, relax in local dev to avoid state cookie issues on http.
		skipStateCookieCheck: env.NODE_ENV !== "production",
	},
	emailAndPassword: {
		enabled: true,
	},
	socialProviders: {
		github: {
			clientId: env.BETTER_AUTH_GITHUB_CLIENT_ID,
			clientSecret: env.BETTER_AUTH_GITHUB_CLIENT_SECRET,
			redirectURI: new URL("/api/auth/callback/github", env.APP_URL).toString(),
		},
	},
	advanced: {
		// Avoid marking cookies secure on plain-http APP_URL (common in local prod builds)
		useSecureCookies: env.APP_URL.startsWith("https://"),
	},
});

export type Session = typeof auth.$Infer.Session;
