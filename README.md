# Create T3 App

This is a [T3 Stack](https://create.t3.gg/) project bootstrapped with `create-t3-app`.

## What's next? How do I make an app with this?

We try to keep this project as simple as possible, so you can start with just the scaffolding we set up for you, and add additional things later when they become necessary.

If you are not familiar with the different technologies used in this project, please refer to the respective docs. If you still are in the wind, please join our [Discord](https://t3.gg/discord) and ask for help.

- [Next.js](https://nextjs.org)
- [NextAuth.js](https://next-auth.js.org)
- [Prisma](https://prisma.io)
- [Drizzle](https://orm.drizzle.team)
- [Tailwind CSS](https://tailwindcss.com)
- [tRPC](https://trpc.io)

## Learn More

To learn more about the [T3 Stack](https://create.t3.gg/), take a look at the following resources:

- [Documentation](https://create.t3.gg/)
- [Learn the T3 Stack](https://create.t3.gg/en/faq#what-learning-resources-are-currently-available) — Check out these awesome tutorials

You can check out the [create-t3-app GitHub repository](https://github.com/t3-oss/create-t3-app) — your feedback and contributions are welcome!

## How do I deploy this?

Follow our deployment guides for [Vercel](https://create.t3.gg/en/deployment/vercel), [Netlify](https://create.t3.gg/en/deployment/netlify) and [Docker](https://create.t3.gg/en/deployment/docker) for more information.

## Commands
npm run check, npm run format, npm run dev

## LOC breakdown (Dec 3, 2025)
- Total tracked LOC (excluding `package-lock.json`): 1,164
- By area: `src/` 677 (`server/` 261, `app/` 223, `trpc/` 133, `src` root 53, `styles/` 7); `start-database.sh` 88; `prisma/` 88; `biome.jsonc` 70; `package.json` 56; `.gitignore` 53; `tsconfig.json` 44; `README.md` 32; `.env.example` 22; `next.config.js` 14; `prisma.config.ts` 9; `public/` 6; `postcss.config.js` 5.
- Counted via `git ls-files | grep -v '^package-lock.json$' | xargs wc -l`.
