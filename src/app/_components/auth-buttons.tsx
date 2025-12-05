"use client";

import { useTransition } from "react";
import type { Session } from "@/server/better-auth";
import { authClient } from "@/server/better-auth/client";

export function AuthButtons({ session }: { session: Session | null }) {
	const [pending, startTransition] = useTransition();

	const handleSignIn = () => {
		startTransition(() => {
			authClient.signIn.social({ provider: "github" });
		});
	};

	const handleSignOut = () => {
		startTransition(() => {
			authClient.signOut();
		});
	};

	const buttonClasses =
		"rounded-full bg-white/10 px-10 py-3 font-semibold no-underline transition hover:bg-white/20 disabled:opacity-60";

	if (!session) {
		return (
			<button
				className={buttonClasses}
				disabled={pending}
				onClick={handleSignIn}
				type="button"
			>
				Sign in with Github
			</button>
		);
	}

	return (
		<button
			className={buttonClasses}
			disabled={pending}
			onClick={handleSignOut}
			type="button"
		>
			Sign out
		</button>
	);
}
