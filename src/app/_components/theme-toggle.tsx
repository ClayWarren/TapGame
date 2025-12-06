"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeToggle() {
	const { resolvedTheme, setTheme } = useTheme();
	const [mounted, setMounted] = useState(false);

	useEffect(() => setMounted(true), []);

	if (!mounted) return null;

	const next = resolvedTheme === "dark" ? "light" : "dark";
	return (
		<button
			aria-label="Toggle theme"
			className="text-(--fg)] hover:bg-(--fg-muted)] hover:text-(--accent)] inline-flex h-9 w-9 items-center justify-center rounded-full transition-colors duration-200"
			onClick={() => setTheme(next)}
			title="Toggle theme"
			type="button"
		>
			{resolvedTheme === "dark" ? "🌞" : "🌙"}
		</button>
	);
}
