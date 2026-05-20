# Compare 2027

Compare 2027 is a French public-interest web app for comparing candidates, parties, programs, and public positions for the 2027 French presidential campaign.

The public-facing content is written in French. Code, repository documentation, and developer-facing naming stay in English.

Production URL: <https://compare2027.fr/>

## Sources

Compare 2027 is designed around verifiable, URL-based sources first. Current primary sources are public web pages, official program links, interviews, speeches, press releases, articles, reports, and institutional records.

The backend source model is also prepared for future source families, especially public posts such as X posts and vote records such as `datan.fr` votes. User-submitted sources are kept pending until processing and editorial review are complete.

## Inspirations And Alternatives

Compare 2027 is inspired by, and sits alongside, other civic tech projects that help voters understand political candidates, parties, programs, and representatives:

- [Elyze](https://github.com/francoismari/elyze), a 2022 French presidential election comparison app.
- [VoteFinder](https://github.com/arnaudsm/votefinder.eu) / [votefinder.fr](https://votefinder.fr/), a voter matching project for elections.
- [Datan](https://github.com/datanfr/datan) / [datan.fr](https://datan.fr/), a platform for tracking and understanding the work of elected representatives.
- [#POURQUITUVOTES](https://pourquituvotes.fr/), a program comparison and voter quiz project for French elections; it does not appear to be open source.
- [Match République](https://matchrepublique.fr/), a French political AI for understanding, comparing, and participating; it does not appear to be open source.

## Stack

- Next.js App Router
- React
- Payload CMS
- Vercel Postgres through `@payloadcms/db-vercel-postgres`
- Vercel Flags through `flags` and `@flags-sdk/vercel`
- shadcn-style components in `src/components`
- Tailwind CSS v4
- pnpm 10

## Project Structure

```txt
src/
├── app/
│   ├── (frontend)/        # Public website
│   └── (payload)/         # Payload admin and API routes
├── collections/           # Payload collections
├── components/            # Frontend and shadcn-style UI components
├── migrations/            # Payload database migrations
├── payload-types.ts       # Generated Payload types
└── payload.config.ts      # Payload configuration
```

## Local Setup

```bash
pnpm install
cp .env.example .env
pnpm dev
```

Edit `.env` if your local services differ from the fake values in `.env.example`.

Open <http://localhost:3000> for the public site and <http://localhost:3000/admin> for Payload admin.

## Common Commands

- `pnpm dev` starts the Next.js development server.
- `pnpm build` builds the app for production.
- `pnpm lint` runs ESLint.
- `pnpm test` runs integration and end-to-end tests.
- `pnpm generate` regenerates Payload schema, import map, and types.

## Frontend Guidelines

- Keep route files in `src/app/(frontend)` small.
- Put reusable frontend components in `src/components`.
- Put shadcn-style primitives in `src/components/ui`.
- Keep visible public copy in French.
- Keep code, component names, commit messages, and docs in English.

## Payload CMS

Payload is configured in `src/payload.config.ts` and currently uses Vercel Postgres. The generated types are stored in `src/payload-types.ts`.

After changing collections or Payload config, run `pnpm generate`.

## Deployment

This project runs on Vercel with the same variables shown in `.env.example`. Vercel automatically provides `VERCEL_ENV`, `VERCEL_PROJECT_PRODUCTION_URL`, and `VERCEL_URL`; do not configure them manually.

## Feature Flags

Feature flags are declared in `src/flags.ts` and exposed to the Vercel Flags Explorer through `src/app/.well-known/vercel/flags/route.ts`.

The initial flag is `compare-response-feedback`, which controls the thumbs up/down feedback controls below compare chat responses. The flag defaults to disabled when Vercel Flags are not configured.

After enabling Vercel Flags for the project, pull `FLAGS` and `FLAGS_SECRET` locally with `vercel env pull`.
