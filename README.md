# Tap Game

Modern full-stack web app scaffold using Next.js, tRPC, Prisma, and TypeScript 7.

## All hand written code, none by AI

## Architecture (scaffold)
- **Next.js App Router** (server actions + RSC) with Turbopack build; routes live under `src/app`.
- **tRPC v11 + React Query v5**: server router in `src/server/api`, React hooks in `src/trpc`. Hydration helpers for RSC/CSR; context wires Prisma + Better Auth session. Typed end-to-end with **TypeScript 7** and input validation via **Zod**.
- **Auth**: Better Auth (GitHub OAuth + email/password) with Prisma adapter; server helpers in `src/server/better-auth`, client hooks in `src/server/better-auth/client.ts`; shared actions in `src/server/actions/auth.ts`.
- **Data**: Prisma client generated to `generated/prisma`; Postgres via `pg` pool (`src/server/db.ts`). Current models: `User`, `Post`, auth tables.
- **UI**: **React 19** with the Next.js App Router; client components coexist with RSC as needed.
- **Styling**: Tailwind CSS (v4) + `globals.css`; minimal custom styles.
- **Quality**: Biome for lint/format; Vitest + Testing Library + Playwright for e2e; tsgo `--noEmit`. CI not set up yet.
- **Environment**: Configured with `@t3-oss/env-nextjs`; required vars include `BETTER_AUTH_SECRET` (>=32 chars), GitHub client creds, `DATABASE_URL`, `APP_URL`.

Deployed on Vercel https://writingcode.vercel.app
