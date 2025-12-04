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
