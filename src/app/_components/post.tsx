"use client";

import { useEffect, useState } from "react";

import { api } from "@/trpc/react";

export function LatestPost() {
	const [latestPost] = api.post.getLatest.useSuspenseQuery();

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

	const display = cached ?? latestPost?.name ?? null;

	return (
		<div className="w-full max-w-xs">
			{display !== null ? (
				<p className="truncate">Score: {display}</p>
			) : (
				<p>You have no posts yet.</p>
			)}
			<form
				className="flex flex-col gap-2"
				onSubmit={(e) => {
					e.preventDefault();
					const currentScore = Number(display) || 0;
					const nextScore = currentScore + 1;
					setCached(nextScore);
					globalThis.localStorage?.setItem("score", String(nextScore));
					void createPost.mutateAsync({ name: String(nextScore) });
				}}
			>
				{error && <p className="text-red-200 text-sm">{error}</p>}
				<button
					className="rounded-full bg-white/10 px-10 py-3 font-semibold transition hover:bg-white/20"
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
