import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";

import { env } from "@/env";
import { db } from "@/server/db";

export const auth = betterAuth({
	database: prismaAdapter(db, {
		provider: "postgresql",
	}),
	account: {
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
		useSecureCookies: env.APP_URL.startsWith("https://"),
	},
});

// Future expansion (Better Auth):
// - Add providers (Google, etc.) under `socialProviders`; supply clientId/clientSecret/redirectURI.
// - Configure email templates or delivery adapters if you add magic links/verification emails.
// - Adjust session settings (lifetimes, refresh) or password policy in `account`/`emailAndPassword`.
// - Use webhooks/callbacks to sync profile data or provision roles on sign-up.
// - Consider multi-tenant or RBAC by injecting tenant/org context into the session.

export type Session = typeof auth.$Infer.Session;
