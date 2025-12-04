# Create T3 App

## LOC breakdown (Dec 3, 2025)
- Total tracked LOC (excluding `package-lock.json`): 1,492
- Tests LOC: 277 (`src/app/_components/post.test.tsx` 54; `src/server/api/routers/post.test.ts` 186; `test/__mocks__/trpcReactMock.ts` 37)
- By area: `src/` 921 (`app/` 271, `server/` 455, `trpc/` 133, `src` root 55, `styles/` 7); `start-database.sh` 88; `prisma/` 88; `biome.jsonc` 70; `package.json` 62; `.gitignore` 53; `tsconfig.json` 47; `README.md` 37; `.env.example` 29; `next.config.js` 14; `prisma.config.ts` 10; `vitest.config.ts` 20; `vitest.setup.ts` 5; `postcss.config.js` 5; `public/` 6; `test/` 37.
- Counted via `git ls-files | grep -v '^package-lock.json$' | xargs wc -l`.

## Architecture (scaffold)
- **Next.js App Router** (server actions + RSC) with Turbopack build; routes live under `src/app`.
- **tRPC v11 + React Query v5**: server router in `src/server/api`, React hooks in `src/trpc`. Hydration helpers for RSC/CSR; context wires Prisma + Better Auth session.
- **Auth**: Better Auth (GitHub OAuth + email/password) with Prisma adapter; server helpers in `src/server/better-auth`, client hooks in `src/server/better-auth/client.ts`; shared actions in `src/server/actions/auth.ts`.
- **Data**: Prisma client generated to `generated/prisma`; Postgres via `pg` pool (`src/server/db.ts`). Current models: `User`, `Post`, auth tables.
- **Styling**: Tailwind CSS (v4 beta) + `globals.css`; minimal custom styles.
- **Quality**: Biome for lint/format; Vitest + Testing Library; tsc `--noEmit`. CI not set up yet.
- **Environment**: Configured with `@t3-oss/env-nextjs`; required vars include `BETTER_AUTH_SECRET` (>=32 chars), GitHub client creds, `DATABASE_URL`, `APP_URL`.
