# Compare 2027

Compare 2027 is a French public-interest web app for comparing candidates, parties, programs, and public positions for the 2027 French presidential campaign.

The public-facing content is written in French. Code, repository documentation, and developer-facing naming stay in English.

Production URL: <https://compare-2027.vercel.app/>

## Stack

- Next.js App Router
- React
- Payload CMS
- Vercel Postgres through `@payloadcms/db-vercel-postgres`
- shadcn-style components in `src/components`
- Tailwind CSS v4
- pnpm

## Project Structure

```txt
src/
├── app/
│   ├── (frontend)/        # Public website
│   └── (payload)/         # Payload admin and API routes
├── collections/           # Payload collections
├── components/            # Frontend and shadcn-style UI components
├── lib/                   # Shared frontend utilities
├── migrations/            # Payload database migrations
├── payload-types.ts       # Generated Payload types
└── payload.config.ts      # Payload configuration
```

## Local Setup

Install dependencies:

```bash
pnpm install
```

Create a local `.env` file with the required variables:

```bash
PAYLOAD_SECRET=your-local-secret
POSTGRES_URL=postgres://user:password@host:5432/database
BETTER_AUTH_SECRET=your-local-auth-secret
BLOB_READ_WRITE_TOKEN=your-vercel-blob-token
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

`BLOB_READ_WRITE_TOKEN`, `GOOGLE_CLIENT_ID`, and `GOOGLE_CLIENT_SECRET` are optional locally. Without a Blob token, media uploads fall back to local Payload storage. Without Google credentials, auth still supports email/password. The server URL is derived from Vercel's automatic `VERCEL_ENV`, `VERCEL_PROJECT_PRODUCTION_URL`, and `VERCEL_URL` variables, with `http://localhost:3000` as the local fallback.

Start the development server:

```bash
pnpm dev
```

Open <http://localhost:3000> for the public site and <http://localhost:3000/admin> for Payload admin.

## Scripts

- `pnpm dev` starts the Next.js development server.
- `pnpm build` builds the app for production.
- `pnpm start` starts the production server after a build.
- `pnpm lint` runs ESLint.
- `pnpm generate:types` regenerates Payload TypeScript types.
- `pnpm generate:importmap` regenerates the Payload admin import map.
- `pnpm test:int` runs integration tests.
- `pnpm test:e2e` runs Playwright end-to-end tests.
- `pnpm test` runs integration and end-to-end tests.

## Frontend Guidelines

- Keep route files in `src/app/(frontend)` small.
- Put reusable frontend components in `src/components`.
- Put shadcn-style primitives in `src/components/ui`.
- Use `src/lib/utils.ts` for shared UI utilities such as `cn`.
- Keep visible public copy in French.
- Keep code, component names, commit messages, and docs in English.

## Payload CMS

Payload is configured in `src/payload.config.ts` and currently uses Vercel Postgres. The generated types are stored in `src/payload-types.ts`.

Backend plugins live in `src/plugins`:

- `auth.ts` configures Payload Auth / Better Auth with public `user` accounts and `editor` / `admin` admin roles.
- `search.ts` indexes public content collections through `@payloadcms/plugin-search`.
- `vercelBlob.ts` stores media in Vercel Blob when `BLOB_READ_WRITE_TOKEN` is configured.

After changing collections or Payload config, run:

```bash
pnpm generate:types
pnpm generate:importmap
```

## Deployment

This project is intended to run on Vercel. Configure the same environment variables in the Vercel project settings:

- `PAYLOAD_SECRET`
- `POSTGRES_URL`
- `BETTER_AUTH_SECRET`
- `BLOB_READ_WRITE_TOKEN`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`

Vercel automatically provides `VERCEL_ENV`, `VERCEL_PROJECT_PRODUCTION_URL`, and `VERCEL_URL`; do not configure them manually.

The repository no longer includes Docker setup because local Docker deployment is not part of the current workflow.
