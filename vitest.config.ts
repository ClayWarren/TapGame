import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
	test: {
		environment: "node",
		globals: true,
		setupFiles: ["./vitest.setup.ts"],
		include: ["src/**/*.{test,spec}.{ts,tsx}"],
		css: false,
		coverage: {
			reporter: ["text", "html"],
			exclude: ["generated/**", "**/*.d.ts", "test/**"],
			thresholds: {
				branches: 85,
				functions: 95,
				lines: 95,
				statements: 95,
			},
		},
	},
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src"),
		},
	},
});
