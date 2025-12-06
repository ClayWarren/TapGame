import { FaGithub } from "react-icons/fa";
import { AuthButtons } from "@/app/_components/auth-buttons";
import { LatestPost } from "@/app/_components/post";
import { ThemeToggle } from "@/app/_components/theme-toggle";
import { getSession } from "@/server/better-auth/server";
import { api, HydrateClient } from "@/trpc/server";

export default async function Home() {
	const session = await getSession();

	if (session) {
		await api.post.getLatest.prefetch();
	}

	return (
		<HydrateClient>
			<main className="flex min-h-screen flex-col items-center justify-center bg-[linear-gradient(to_bottom,var(--hero-from),var(--hero-to))] text-[color:var(--fg)] transition-colors duration-200">
				<div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
					<div className="flex w-full items-center justify-end gap-3">
						<ThemeToggle />
						<a
							aria-label="view the repo on Github"
							className="text-(--fg)] hover:text-(--accent)] inline-flex items-center gap-2 transition"
							href="https://github.com/ClayWarren/TapGame"
						>
							<FaGithub aria-hidden size={22} />
							<span>Github</span>
						</a>
					</div>

					<h1 className="font-extrabold text-5xl tracking-tight sm:text-[5rem]">
						Tap <span className="text-(--accent)]" /> Game
					</h1>

					<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-8" />

					<div className="flex flex-col items-center gap-2">
						<div className="flex flex-col items-center justify-center gap-4">
							<p className="text-center text-2xl">
								{session && <span>Logged in as {session.user?.name}</span>}
							</p>
							<AuthButtons session={session} />
						</div>
					</div>

					<LatestPost isAuthenticated={Boolean(session?.user)} />
				</div>
			</main>
		</HydrateClient>
	);
}

// Touch this page when you redesign the landing experience, change auth flows (e.g., different
// providers/actions), or alter which data is prefetched/hydrated for the home view.
