# Student QR Verification System

A production-grade student identity, QR verification, attendance, and reporting
platform for a Cambodian high school.

> Built in phases. This README grows as each phase lands. Currently through
> **Phase 1 — Project Setup**.

## Tech Stack

| Layer          | Choice                                                        |
| -------------- | -------------------------------------------------------------- |
| Frontend       | Next.js 15 (App Router), React 19, TypeScript (strict)        |
| Styling / UI   | Tailwind CSS v4, shadcn/ui (Radix primitives), Lucide icons    |
| Forms          | React Hook Form + Zod                                          |
| Backend        | Next.js API Routes + Server Actions                             |
| Database       | Supabase (PostgreSQL) with Row Level Security                  |
| Auth           | Firebase Authentication (Google + Email/Password)               |
| Storage        | Supabase Storage (student photos, exports)                     |
| Server state   | TanStack Query                                                  |
| Client state   | Zustand                                                         |
| QR             | `qrcode` (generate), `html5-qrcode` (scan)                     |
| Reports        | `exceljs` / `xlsx` (Excel), `jspdf` (PDF)                       |
| Deployment     | Vercel                                                          |

## Project Structure

Feature-based architecture: cross-cutting UI/business logic for a domain
(students, teachers, attendance, QR, etc.) lives together under `features/`,
while `app/` stays thin — routes, layouts, and composition only.

```text
app/
  (public)/            # unauthenticated routes: /login, /student/[token]
  admin/               # staff-only routes: dashboard, students, teachers, ...
  api/                 # route handlers (REST-style JSON endpoints)

features/              # one folder per business domain
  students/
    components/        # domain UI (StudentForm, StudentTable, ...)
    hooks/              # useStudents(), useStudent(id), ...
    services/           # repository-pattern data access
    schemas/            # Zod schemas (create/update/filter)
    types/
  teachers/ academics/ attendance/ qr/ verification/ cards/ dashboard/
  reports/ auth/        # same shape as students/

components/
  ui/                   # shadcn/ui primitives (generated, do not hand-edit)
  layout/               # AppShell, Sidebar, Header, PageHeader
  shared/                # cross-feature components (DataTable, EmptyState...)
  providers/             # QueryProvider, AppProviders

lib/
  supabase/              # client.ts (browser), server.ts (RSC), admin.ts (service role)
  firebase/               # client.ts (Firebase Auth SDK), admin.ts (Admin SDK)
  repositories/           # shared repository base classes/helpers
  constants/              # roles, student-status, routes
  rbac/                   # permission matrix + guards (Phase 3)
  api/                    # fetch wrappers, API error helpers
  env.ts / env.client.ts  # Zod-validated environment variables

hooks/                  # app-wide hooks (not tied to one feature)
store/                  # Zustand stores (client-only UI state)
types/                  # database.types.ts (generated), shared domain types
utils/                  # pure helper functions
supabase/
  migrations/           # SQL migration files (Phase 2)
  seed/                 # seed data scripts
```

## Prerequisites

- Node.js 20+
- A [Supabase](https://supabase.com) project (Phase 2)
- A [Firebase](https://console.firebase.google.com) project with Authentication
  enabled — Google and Email/Password providers (Phase 3)

## Getting Started

```bash
npm install
cp .env.example .env.local
# fill in .env.local with your Supabase + Firebase credentials
npm run dev
```

The app runs at <http://localhost:3000> (or the next available port).

## Scripts

| Command                | Description                              |
| ----------------------- | ---------------------------------------- |
| `npm run dev`           | Start the dev server (Turbopack)         |
| `npm run build`         | Production build                          |
| `npm run start`         | Serve the production build                |
| `npm run lint`          | ESLint (Next.js core-web-vitals + TS)     |
| `npm run typecheck`     | `tsc --noEmit`                            |
| `npm run format`        | Prettier (writes)                         |
| `npm run format:check`  | Prettier (check only, for CI)             |

## Environment Variables

See [`.env.example`](./.env.example) for the full list. Notable points:

- Anything prefixed `NEXT_PUBLIC_` is bundled into client JavaScript — never
  put secrets there.
- `SUPABASE_SERVICE_ROLE_KEY` and the Firebase Admin credentials are
  server-only. `lib/env.ts` (guarded by the `server-only` package) will fail
  the build if a client component tries to import it.
- `lib/env.client.ts` and `lib/env.ts` validate `process.env` against a Zod
  schema at module-load time, so a missing/misnamed variable fails fast with
  a clear error instead of an obscure runtime crash three layers deep.

## Security Notes

- The public `/student/[token]` verification page hides phone/email/address
  from anonymous visitors and only reveals them when the viewer has a valid
  staff session — verified against the **production build** (`npm run build && npm start`).
  `next dev` embeds extra React Server Component debug payloads (for its
  error overlay) into the raw HTML that include prop values even for
  branches that don't visually render — harmless in dev, but never expose a
  `next dev` server to the public internet; always test PII-sensitive pages
  against a production build.

## Database

Schema lives in [`supabase/migrations/`](./supabase/migrations/) (10 files,
applied in filename order) and seed data in [`supabase/seed/`](./supabase/seed/).

Apply to your linked Supabase project:

```bash
npx supabase login
npx supabase link --project-ref <your-project-ref>   # e.g. sjorewkknjryeibsuktj
npx supabase db push                                  # runs migrations
psql "$(npx supabase db url)" -f supabase/seed/01_rbac.sql \
  -f supabase/seed/02_student_status.sql \
  -f supabase/seed/03_academics.sql \
  -f supabase/seed/04_addresses.sql \
  -f supabase/seed/05_demo_students.sql
# or: paste each seed/*.sql file into Dashboard > SQL Editor, in numeric order
```

Then regenerate real TypeScript types (replaces the hand-authored stand-in
in `types/database.types.ts`):

```bash
npx supabase gen types typescript --linked > types/database.types.ts
```

**Key design decisions** (schema intentionally diverges a little from the
flat field list in the spec, in favor of normalization):

- `students.faculty` / `major` / `degree` / `batch` from the spec become
  foreign keys — `department_id`, `study_program_id`, `class_id`,
  `academic_year_id` — so dashboard charts ("Enrollment by Year", "Students
  by Grade") and referential integrity work without free-text drift.
- `addresses` is a self-referencing **Cambodian administrative division**
  reference table (province → district → commune → village), used to power
  cascading dropdowns. The student's own address stays flat text
  (`students.province/district/commune/village`) for fast, join-free reads
  on the profile/card — the app validates the picked value against
  `addresses` rather than joining on every read.
- `student_status` is a lookup table (mirrors `lib/constants/student-status.ts`)
  rather than a native Postgres enum, so new statuses don't require a schema
  migration.
- Emergency contact is just a `parents` row with
  `student_parents.is_emergency_contact = true`, not a duplicate field set
  on `students`.
- RLS policies assume Firebase is registered as a **Third-Party Auth**
  provider in the Supabase dashboard (Authentication → Sign In / Providers →
  Third-Party Auth → Firebase, using your Firebase project ID) so
  `auth.jwt()` carries the Firebase ID token claims. This is optional
  defense-in-depth: the primary authorization boundary is server-side
  (Firebase Admin SDK token verification + `users.role_code` check before
  any DB call — see Phase 3), so the app works correctly even if
  Third-Party Auth is never configured — direct client-side Supabase calls
  just fail closed instead.

## Design System

- Theme: Blue (primary) + White (surfaces) + Green (accent/success), defined
  as CSS variables in `app/globals.css` (light + dark mode).
- Fonts: **Inter** for Latin text, **Noto Sans Khmer** for Khmer text
  (`font-khmer` utility class), loaded via `next/font/google` in
  `app/layout.tsx`.
- Components: shadcn/ui on Radix primitives (`components.json` pins
  `"style": "radix-nova"` — do not run `shadcn init` again without `-b radix`,
  the current CLI default now generates Base UI-flavored components instead
  of Radix).

## Status

- [x] Phase 1 — Project setup
- [x] Phase 2 — Database
- [x] Phase 3 — Authentication
- [x] Phase 4 — Student CRUD
- [x] Phase 5 — QR Generator + Student Card
- [x] Phase 6 — QR Scanner
- [x] Phase 7 — Public Student Verification
- [x] Phase 8 — Admin Dashboard
- [x] Phase 9 — Attendance
- [x] Phase 10 — Reports

## Known Gaps / Follow-ups

- **Academics management CRUD** (departments, study programs, academic years,
  classes) is read-only via seed data + `/api/academics/options` — there's no
  admin UI to create/edit these beyond SQL. Not one of the 10 numbered phases,
  but a natural next addition.
- **"Assign Classes"** (Teacher Module) is implemented as homeroom assignment
  only (`classes.homeroom_teacher_id`) — there's no many-to-many
  subject-teaching assignment (a teacher teaching multiple classes for one
  subject).
- No dedicated **student self-service portal** — the `student` role can
  authenticate and RLS/API routes already scope them to their own data, but
  no `/student-portal`-style UI is built beyond the public verification page.
- **Supabase Third-Party Auth** (Firebase JWT recognition) is documented but
  not required — confirm it's configured if you want RLS to be a real
  second authorization layer rather than pure defense-in-depth.
