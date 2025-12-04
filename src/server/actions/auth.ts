"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/server/better-auth";

export async function signInWithGithub() {
	const res = await auth.api.signInSocial({
		body: {
			provider: "github",
			callbackURL: "/",
		},
	});

	if (!res.url) {
		throw new Error("No URL returned from signInSocial");
	}

	redirect(res.url);
}

export async function signOut() {
	await auth.api.signOut({
		headers: await headers(),
	});
	redirect("/");
}

// Future changes: update these actions if you add providers, change callback/return URLs,
// pass additional state (e.g., `returnTo`), or need custom error handling/logging/CSRF checks.
