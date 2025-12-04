import { LatestPost } from "@/app/_components/post";
import { signInWithGithub, signOut } from "@/server/actions/auth";
import { getSession } from "@/server/better-auth/server";
import { api, HydrateClient } from "@/trpc/server";

export default async function Home() {
	const session = await getSession();

	if (session) {
		await api.post.getLatest.prefetch();
	}

	return (
		<HydrateClient>
			<main className="flex min-h-screen flex-col items-center justify-center bg-linear-to-b from-[#2e026d] to-[#15162c] text-white">
				<div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
					<h1 className="font-extrabold text-5xl tracking-tight sm:text-[5rem]">
						Tap <span className="text-[hsl(280,100%,70%)]"></span> Game
					</h1>
					<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-8"></div>
					<div className="flex flex-col items-center gap-2">
						<div className="flex flex-col items-center justify-center gap-4">
							<p className="text-center text-2xl text-white">
								{session && <span>Logged in as {session.user?.name}</span>}
							</p>
							{!session ? (
								<form>
									<button
										className="rounded-full bg-white/10 px-10 py-3 font-semibold no-underline transition hover:bg-white/20"
										formAction={signInWithGithub}
										type="submit"
									>
										Sign in with Github
									</button>
								</form>
							) : (
								<form>
									<button
										className="rounded-full bg-white/10 px-10 py-3 font-semibold no-underline transition hover:bg-white/20"
										formAction={signOut}
										type="submit"
									>
										Sign out
									</button>
								</form>
							)}
						</div>
					</div>

					{session?.user && <LatestPost />}
				</div>
			</main>
		</HydrateClient>
	);
}

// Touch this page when you redesign the landing experience, change auth flows (e.g., different
// providers/actions), or alter which data is prefetched/hydrated for the home view.
