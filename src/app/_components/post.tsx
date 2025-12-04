"use client";

import { useState } from "react";

import { api } from "@/trpc/react";

export function LatestPost() {
	const [latestPost] = api.post.getLatest.useSuspenseQuery();

	const utils = api.useUtils();
	const [name, setName] = useState("");
	const [error, setError] = useState<string | null>(null);
	const createPost = api.post.create.useMutation({
		onSuccess: async () => {
			await utils.post.invalidate();
			setName("");
			setError(null);
		},
		onError: (err) => {
			setError(err.message ?? "Failed to create post");
		},
	});

	return (
		<div className="w-full max-w-xs">
			{latestPost ? (
				<p className="truncate">Score: {latestPost.name}</p>
			) : (
				<p>You have no posts yet.</p>
			)}
			<form
				className="flex flex-col gap-2"
				onSubmit={async (e) => {
					e.preventDefault();
					const trimmed = name.trim();
					if (!trimmed) {
						setError("Title is required");
						return;
					}

					try {
						await createPost.mutateAsync({ name: trimmed });
					} catch {}
				}}
			>
				<input
					className="w-full rounded-full bg-white/10 px-4 py-2 text-white"
					onChange={(e) => setName(e.target.value)}
					placeholder="Title"
					type="text"
					value={name}
				/>
				{error && <p className="text-red-200 text-sm">{error}</p>}
				<button
					className="rounded-full bg-white/10 px-10 py-3 font-semibold transition hover:bg-white/20"
					disabled={createPost.isPending || name.trim().length === 0}
					type="submit"
				>
					{createPost.isPending ? "Submitting..." : "Tap Me!"}
				</button>
			</form>
		</div>
	);
}

// Touch this component if you change post query/mutation shapes, want better error UX,
// add optimistic updates, or replace suspense with standard queries.
