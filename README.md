# Khanya Nature School

A complete demo website and content management system for a fictional nature-based preschool in Randburg and Fourways, South Africa. The public site is calm and editorial. The admin is a practical working CMS, not a mock-up.

Everything is demo data. Khanya Nature School does not exist, the contact details are fictional, and the enquiry emails are written to a local outbox rather than sent.

## What is included

- Public website with home, about, programmes, branches, news, events, gallery, admissions, contact, privacy, a thank you page and a branded 404.
- Search-engine metadata on every page, canonical URLs, Open Graph and Twitter cards, JSON-LD, a dynamic sitemap and `robots.txt`.
- Admin CMS with dashboard, branches, programmes, news, events, galleries, media, documents, enquiries, users, site settings and outbox.
- Email and password sign-in through better-auth. Public sign-up is disabled. There are two roles, admin and editor.
- PostgreSQL database, Prisma schema, migration and a seed that creates a full term of realistic demo content.
- Playwright smoke tests for public routes, admin flows, responsive layouts and WCAG A and AA accessibility.
- Image brief in `web/public/images/README.md`. Every seeded image has a named file, ratio, minimum size and subject.

## Stack

| Layer | Choice |
| --- | --- |
| Web | Next.js 16 App Router, React 19, TypeScript strict, Tailwind CSS v4 |
| API | Express 5, TypeScript, Prisma 7, PostgreSQL 16 |
| Auth | better-auth with the Prisma adapter |
| Validation | Zod on API input and public forms |
| Tests | Playwright and `@axe-core/playwright` |
| Type and lint | TypeScript 5.9, ESLint 9 |

The repository is a pnpm workspace:

- `web/` runs on `http://localhost:3002`.
- `api/` runs on `http://localhost:4002`.
- PostgreSQL listens on host port `5442` with database `khanya`, user `postgres` and password `postgres`.

## Quick start

### Requirements

- Node.js 22 or newer.
- pnpm 12 through Corepack or a global install.
- Docker Desktop for the bundled PostgreSQL container. If Docker is unavailable, see the local database note below.

### 1. Install dependencies

```powershell
pnpm install
```

### 2. Create the environment files

The API and web app each read their own environment file.

```powershell
Copy-Item .env.example api/.env
Copy-Item .env.example web/.env.local
```

Change `BETTER_AUTH_SECRET` before using this anywhere except a local demo. The default demo secret is deliberately obvious.

### 3. Start PostgreSQL

```powershell
pnpm db:up
```

This runs the `postgres:16-alpine` service in `docker-compose.yml` and waits for it to become healthy.

If Docker is not available, run any local PostgreSQL 16 or newer instance with these settings:

```text
host: localhost
port: 5442
database: khanya
user: postgres
password: postgres
```

The same `DATABASE_URL` works either way.

### 4. Apply the schema and seed demo content

```powershell
pnpm db:migrate
pnpm db:seed
```

`db:seed` clears the demo tables and rebuilds the full content set. It is the fastest way to return to a clean demonstration state. It does not use `prisma migrate reset`, so it keeps the schema in place.

### 5. Run the site

```powershell
pnpm dev
```

Open `http://localhost:3002`. The API health check is at `http://localhost:4002/health`.

If you already have PostgreSQL running, you can run the two apps separately:

```powershell
pnpm --filter @khanya/api dev
pnpm --filter @khanya/web dev
```

## Demo accounts

| Role | Email | Password |
| --- | --- | --- |
| Admin | `admin@khanyanatureschool.example` | `KhanyaAdmin2027!` |
| Editor | `editor@khanyanatureschool.example` | `KhanyaEditor2027!` |

The passwords come from `SEED_ADMIN_PASSWORD` and `SEED_EDITOR_PASSWORD`. If you change those variables, reseed.

Sign in at `/admin/login`. Public sign-up is disabled; accounts are created by an admin inside `/admin/users`.

## Public routes

| Route | Purpose |
| --- | --- |
| `/` | Home page and the school's main editorial statement |
| `/about` | Story, team, approach and garden |
| `/programmes` | Programme overview |
| `/programmes/[slug]` | Programme detail, age range and fee |
| `/branches` | Active branches only |
| `/branches/[slug]` | Branch detail, hours, directions and programme list |
| `/news` | Published news and notices |
| `/news/[slug]` | Article detail |
| `/events` | Calendar and upcoming events |
| `/events/[slug]` | Event detail with an `.ics` download |
| `/gallery` | Published albums |
| `/gallery/[slug]` | Album with lightbox |
| `/admissions` | Process, fees and the enquiry form |
| `/contact` | Branch contact details, hours and WhatsApp links |
| `/privacy` | POPIA-minded privacy notice |
| `/enquiry/thank-you` | Confirmation with the enquiry reference |
| `/sitemap.xml` | Dynamic sitemap with active content only |
| `/robots.txt` | Crawl rules, including `/admin` and `/api` |

Branch activation is a single switch. When a branch is hidden, it disappears from the header, footer, branch list, public branch route, enquiry branch picker, contact page, sitemap and navigation data. Its programmes remain available under other active branches.

## Admin modules

| Module | What it does |
| --- | --- |
| Dashboard | Content counts, enquiries needing attention and shortcuts |
| Branches | Create, edit, sort, activate and hide branches |
| Programmes | Create, edit, publish, set fees and link to branches |
| News | Drafts and published posts, pinned posts, cover media and SEO |
| Events | Dates in Africa/Johannesburg, locations, branch links and calendar files |
| Galleries | Albums, album photos, ordering, captions and alt text |
| Media | Upload, filter, edit descriptions and delete images or PDFs |
| Documents | Public PDFs with labels, sizes and download tracking fields |
| Enquiries | Search, filter, open, change status, add notes and export CSV |
| Users | Admin only. Add people, change roles, deactivate and reset passwords |
| Site settings | School identity, social links, default SEO and WhatsApp message |
| Outbox | Every demo email written by the application, with a preview |

Editors can manage content, media, documents, enquiries and the outbox. Admin-only modules are users and site settings. The API enforces the role; hiding a navigation item is not treated as security.

## How content flows

Public pages are server components. They fetch from the API with `cache: "no-store"`, so an admin save is visible on the next page load. There is no separate publish build and no stale copy in the web app.

The API is the source of truth. The web app rewrites `/api/*` to the API server, which keeps browser cookies same-origin and avoids a separate public API URL in client code.

All branch, programme, post, event, album and document data comes from PostgreSQL. The only content hard-coded in the web app is static editorial copy on pages that are not CMS-managed, plus the privacy notice and interface labels.

WhatsApp buttons use `NEXT_PUBLIC_WHATSAPP_NUMBER` as the fallback number, defaulting to `27825550100`. Branch pages use the branch's own number from the CMS. Messages are prefilled and context-aware for the school, a programme or a branch.

## Scripts

Run these from the repository root.

| Script | What it does |
| --- | --- |
| `pnpm dev` | Starts PostgreSQL through Docker, then the API and web app together |
| `pnpm db:up` | Starts and waits for the PostgreSQL container |
| `pnpm db:migrate` | Creates or updates the local schema with Prisma |
| `pnpm db:seed` | Clears demo content and rebuilds the seeded school |
| `pnpm db:reset` | Destructive Prisma reset, then seed |
| `pnpm typecheck` | TypeScript checks in both workspaces |
| `pnpm lint` | ESLint in both workspaces |
| `pnpm build` | Builds the API and the Next.js production output |
| `pnpm smoke` | Runs the full Playwright suite |

## Testing

Install the Chromium browser once:

```powershell
pnpm exec playwright install chromium
```

Make sure the database is migrated and seeded, then run:

```powershell
pnpm smoke
```

The Playwright config starts the API and web app if they are not already running. Existing servers are reused. The suite runs one worker at a time because the admin tests create, edit and delete real demo records.

The checks cover:

- Every public route, one `h1`, the footer credit, canonical metadata, JSON-LD, sitemap, robots and the 404 page.
- Admin sign-in, invalid credentials, dashboard, settings, users and outbox.
- Create, publish, edit and delete a news post through the UI.
- Branch deactivation and restoration, including header, footer and sitemap propagation.
- Enquiry search, detail, status, notes and CSV export.
- Media upload, description edit and delete.
- Editor restrictions at the navigation and API level.
- Public enquiry form validation and submission.
- Mobile layouts at 375 px and desktop at 1440 px.
- Axe WCAG A and AA scans on public pages, admin login and the admin dashboard.

Tests that submit an enquiry, add notes or change a seeded enquiry leave data behind. Run `pnpm db:seed` after a full smoke run if you want the demo to look untouched.

## Images and media

No photographs are checked in. The seed points at `/images/...` names that are intentionally absent, and the `Photo` and `PhotoFrame` components fall back to branded placeholders with the right aspect ratio. The site therefore looks finished while the school collects real photographs.

`web/public/images/README.md` lists all 70 expected files:

- 24 core images for heroes, programmes, branches, team, news and social sharing.
- 46 gallery images across five albums.

Upload new media through `/admin/media`, then choose it on the page or record that uses it. Uploaded files go to `api/uploads/` and are served at `/uploads/...`. Those files are ignored by git, apart from a placeholder file.

The seed also writes six small PDFs into `api/uploads/` so document downloads work in the demo.

## Project structure

```text
.
├── api/
│   ├── prisma/              schema, migration and seed
│   ├── src/
│   │   ├── routes/          public and admin routers
│   │   ├── lib/             validation, mail, uploads, time and CSV helpers
│   │   ├── auth.ts          better-auth configuration
│   │   └── index.ts         Express app
│   └── uploads/             local uploaded and seeded files
├── web/
│   ├── public/images/       image brief and future photographs
│   └── src/
│       ├── app/             public routes, admin routes and metadata files
│       ├── components/      public and admin components
│       └── lib/             API client, formatting, WhatsApp and SEO helpers
├── tests/                   Playwright suites
├── docker-compose.yml       PostgreSQL 16 for local development
├── playwright.config.ts     shared test configuration
├── AGENTS.md                working notes for future contributors
└── DECISIONS.md             architecture and scope decisions
```

## Environment variables

| Variable | Used by | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | API and Prisma | PostgreSQL connection string |
| `API_PORT` | API | Express port, default `4002` |
| `WEB_ORIGIN` | API | Allowed CORS origin and link base |
| `API_URL` | Web and Prisma tooling | Server-side API address |
| `NODE_ENV` | Both | Runtime mode |
| `BETTER_AUTH_SECRET` | API | Session signing secret |
| `BETTER_AUTH_URL` | API | Public auth base URL |
| `SESSION_COOKIE_SECURE` | API | Set to `true` behind HTTPS |
| `NEXT_PUBLIC_API_URL` | Web | Optional browser API base, blank by default |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | Web | Fallback WhatsApp number |
| `NEXT_PUBLIC_SITE_URL` | Web | Canonical site URL for metadata and sitemap |
| `SEED_ADMIN_PASSWORD` | Seed | Admin demo password |
| `SEED_EDITOR_PASSWORD` | Seed | Editor demo password |

## Production notes

This is a sales demo, not a production deployment. Before using it for a real school:

- Replace the demo secret, use HTTPS, set `SESSION_COOKIE_SECURE=true` and restrict `WEB_ORIGIN`.
- Move uploads to durable object storage, or back up `api/uploads/`.
- Replace the outbox with a real transactional email provider and add bounce handling.
- Add a privacy review, data retention jobs and a process for POPIA access requests.
- Add backups, database monitoring and log retention.
- Review the content and photograph consent before publishing.
- Add rate limiting and abuse monitoring at the edge as well as in the API.
- Decide whether editors need branch-scoped permissions. The current demo deliberately does not implement them.

## Scope

The following were left out on purpose: WordPress, payments, a parent portal, bookings, a newsletter, analytics, custom workflows, more than two roles, branch-scoped permissions, third-party integrations, a second language interface, dark mode, comments and site-wide search.

## Credit

Demo website by LSQD Studios. Khanya Nature School is a fictional school.
