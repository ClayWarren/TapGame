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
		<button onClick={() => setTheme(next)} type="button">
			{resolvedTheme === "dark" ? "Light" : "Dark"}
		</button>
	);
}
