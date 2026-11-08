# AGENTS.md

Working notes for anyone, human or agent, changing this repository.

## Read this first

This project uses Next.js 16. The App Router has breaking changes compared with older Next.js versions. Read the bundled guide in `web/node_modules/next/dist/docs/` before changing routing, metadata, caching or server component code. The generated `web/AGENTS.md` block explains why it keeps reappearing.

## What this project is

A fictional school demo for a sales conversation: a polished public site plus a working admin CMS. It is not a real school and it is not production infrastructure. Do not add real personal data.

- `web/`: Next.js 16 App Router, port 3007.
- `api/`: Express 5, Prisma 7, better-auth, port 4007.
- PostgreSQL: port 5442, database `khanya`, user and password `postgres`.
- The API is the source of truth. Public pages fetch it with `cache: "no-store"`.

## Commands

```powershell
pnpm install
Copy-Item .env.example api/.env
Copy-Item .env.example web/.env.local
pnpm db:up
pnpm db:migrate
pnpm db:seed
pnpm dev
```

Useful checks:

```powershell
pnpm typecheck
pnpm lint
pnpm build
pnpm exec playwright install chromium
pnpm smoke
```

`pnpm db:seed` deletes and rebuilds all demo content, including users, enquiries, media records and the outbox. Run it before a demo if the tests have left records behind.

## Local environment quirks

- `pnpm dev` expects Docker. If Docker is unavailable, start a local PostgreSQL 16 or newer server on port 5442 with the credentials above and run the API and web app as two commands. The local development machine used for this build ran PostgreSQL 18 this way; the schema and container specification still target PostgreSQL 16.
- The Playwright config reuses running dev servers. If a port is occupied by an old process, stop it before rerunning.
- On Windows PowerShell 5.1, prefer `curl.exe --data-binary "@file.json"` for JSON API checks. Inline quoting can produce an invalid body.
- Uploaded and seeded PDFs live in `api/uploads/`. Git ignores everything there except the placeholder.

## Code rules

- TypeScript strict. Source files are `.ts` and `.tsx`; do not add `.js` or `.jsx` source.
- Validate external input with Zod. Do not use `any` without a written reason. The generated Prisma client is excluded from source checks.
- Brand colours live in `web/src/app/globals.css` as Tailwind theme tokens. Components use token classes only. Do not add hex colours outside the theme.
- The visual identity is crayon and paper cut-outs: Baloo 2 headings, Mulish body and interface text, Gaegu only for small handwritten annotations, flat paper shapes, 3 px shadows and about 4% grain. Do not reintroduce the old editorial tokens, leaf motifs or portrait shapes.
- Programme and branch colours live in `web/src/lib/tones.ts` and stay fixed across cards, calendars and admin badges. Ink text sits on sun, sky and meadow; white text only on poppy-deep. Text-bearing poppy surfaces use `poppy-deep`, not the bright base poppy.
- Use `formatRand`, `formatDate`, `formatEventWhen`, `formatTime` and related helpers for South African formatting. Do not hand-format dates, times or money in components.
- The school uses South African English and Africa/Johannesburg. Write `R3 200`, `3 March 2027` and `07:00`.
- Do not use em dashes or en dashes in copy. Use a comma, colon, full stop or hyphen.
- Keep the footer credit exact: `Demo website by LSQD Studios. Khanya Nature School is a fictional school.`
- The site is light mode only. Support `prefers-reduced-motion` and keep keyboard focus visible.
- Do not add comments that only restate the code. Comment a non-obvious decision or a workaround.

## Content and data rules

- Public routes must read from the API and database, not from duplicated hard-coded content.
- Branch activation must remain a single source of truth. Hiding a branch must update header, footer, branch list, public branch route, enquiry branch picker, contact page, nav API and sitemap.
- WhatsApp links use `NEXT_PUBLIC_WHATSAPP_NUMBER` as the fallback, defaulting to `27825550100`. Branch numbers come from branch records. Keep messages prefilled and contextual.
- Seeded images intentionally do not exist. `Photo` and `PhotoFrame` must keep their branded placeholder fallback and correct aspect ratio. If you add image names, update `web/public/images/README.md`.
- CMS body copy is trusted Markdown rendered with `marked`. Do not feed untrusted user input into it.
- Seeded dates are relative to seed time. Do not replace them with fixed dates unless the demo script needs a frozen moment.

## Auth and permissions

- better-auth is mounted in Express. Public sign-up is disabled.
- There are exactly two roles: `admin` and `editor`.
- `editor` can manage content, media, documents, enquiries and outbox.
- `admin` can also manage users and site settings.
- Enforce permissions in the API. Hiding a nav item is presentation only.
- Sessions are httpOnly, sameSite `lax` and secure when configured. Do not move session tokens into local storage.
- Admin pages in `web/src/app/admin/(protected)/` are server-guarded through `getSessionUser`, then use `adminFetch` from client components.

## Where things live

- Public routes: `web/src/app/(site)/`
- Admin routes: `web/src/app/admin/(protected)/`
- Public components: `web/src/components/`
- Admin components: `web/src/components/admin/`
- API public routes: `api/src/routes/public.ts`
- API admin routes: `api/src/routes/admin/`
- Schema and seed: `api/prisma/`
- Prisma config: `api/prisma.config.ts`
- Shared schemas and validation: `api/src/lib/schemas.ts`
- Playwright tests: `tests/`
- Test config: `playwright.config.ts`

## Testing expectations

Run all four before calling work finished:

```powershell
pnpm typecheck
pnpm lint
pnpm build
pnpm smoke
```

The smoke suite is serial because it mutates real demo records. It checks public routes, metadata, sitemap, robots, admin login and CRUD, branch propagation, enquiries, media, editor restrictions, responsive layout and axe WCAG A and AA scans.

After a full smoke run, reseed before taking screenshots or handing over:

```powershell
pnpm db:seed
```

If you change the design, re-run the axe and responsive suites, not only the happy path. Check 360, 768 and 1280 px and refresh `docs/screenshots/` when the layout changes.

## Scope

Do not add WordPress, payments, a parent portal, bookings, a newsletter, analytics, custom workflows, more than two roles, branch-scoped permissions, third-party integrations, another language, dark mode, comments or site-wide search without an explicit change of brief.

## Documentation

Keep this file and `DECISIONS.md` current when you make a structural decision. Keep `README.md` current for setup and demo instructions. Avoid duplicating the same explanation in all three files.
