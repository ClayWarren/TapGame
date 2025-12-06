"use client";

import { useEffect, useState } from "react";

import { api } from "@/trpc/react";

export function LatestPost({ isAuthenticated }: { isAuthenticated: boolean }) {
	const { data: latestPost } = api.post.getLatest.useQuery(undefined, {
		enabled: isAuthenticated,
		suspense: false,
		retry: false,
	});

	const utils = api.useUtils();
	const [error, setError] = useState<string | null>(null);
	const [cached, setCached] = useState<number | null>(null);

	// Read cached score once on mount.
	useEffect(() => {
		const saved = globalThis.localStorage?.getItem("score");
		if (saved !== null && saved !== undefined) setCached(Number(saved));
	}, []);

	const createPost = api.post.create.useMutation({
		onSuccess: () => {
			void utils.post.invalidate();
			setError(null);
		},
		onError: (err) => {
			// Fallback to friendly default when the error message is empty/undefined.
			setError(err.message || "Failed to create post");
		},
	});

	const isSaving = isAuthenticated && createPost.isPending;

	const display = cached ?? latestPost?.name ?? null;

	return (
		<div className="w-full max-w-xs">
			<form
				className="flex flex-col items-center gap-3 text-center"
				onSubmit={(e) => {
					e.preventDefault();
					const currentScore = Number(display) || 0;
					const nextScore = currentScore + 1;
					setCached(nextScore);
					globalThis.localStorage?.setItem("score", String(nextScore));

					if (!isAuthenticated) return;

					void createPost.mutateAsync({ name: String(nextScore) });
				}}
			>
				{display !== null ? (
					<p className="font-semibold text-lg">Score: {display}</p>
				) : (
					<p>You have no posts yet.</p>
				)}

				{error && <p className="text-red-200 text-sm">{error}</p>}

				{!isAuthenticated && (
					<p className="text-[color:var(--fg)] text-sm opacity-80">
						Playing offline — sign in anytime to sync your score across devices.
					</p>
				)}

				<button
					className="rounded-full bg-[color:var(--button-bg)] px-10 py-3 font-semibold text-[color:var(--button-fg)] shadow-sm transition hover:opacity-90"
					disabled={isSaving}
					type="submit"
				>
					Tap Me!
				</button>
			</form>
		</div>
	);
}

// Touch this component if you change post query/mutation shapes, want better error UX,
// add optimistic updates, or replace suspense with standard queries.
