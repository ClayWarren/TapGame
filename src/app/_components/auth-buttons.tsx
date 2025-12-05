"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import type { Session } from "@/server/better-auth";
import { authClient } from "@/server/better-auth/client";

export function AuthButtons({ session }: { session: Session | null }) {
	const [pending, startTransition] = useTransition();
	const router = useRouter();

	const handleSignIn = () => {
		startTransition(() => {
			authClient.signIn.social({ provider: "github" });
		});
	};

	const handleSignOut = () => {
		startTransition(async () => {
			await authClient.signOut();
			router.refresh();
		});
	};

	const buttonClasses =
		"rounded-full bg-[color:var(--button-bg)] px-10 py-3 font-semibold text-[color:var(--button-fg)] no-underline shadow-sm transition hover:opacity-90 disabled:opacity-60";

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
