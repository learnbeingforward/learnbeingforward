# Learn Being Forward

Marketing site, auth, and LMS platform for Learn Being Forward — an ed-tech company delivering
placement-focused technical training through campus and corporate partnerships.

## Stack

Next.js 16 (App Router) · TypeScript · Tailwind CSS v4 · Framer Motion · shadcn/ui (Base UI) ·
Prisma ORM · MySQL · NextAuth.js v5 (credentials) · Zod · React Hook Form

## Getting Started

```bash
npm install
cp .env.example .env   # fill in DATABASE_URL with a real MySQL connection string
npx prisma db push     # creates the schema in your database
npm run db:seed        # seeds courses, team, demo college + student/admin accounts
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

The project runs against MySQL (see `datasource db` in `prisma/schema.prisma`). Point
`DATABASE_URL` at a Hostinger-provisioned MySQL database (hPanel → Databases) for both local
dev and production — see `.env.example` for the connection string format.

### Demo logins (seeded, password `password123`)

- College admin: `college@demo.com` → `/lms/college`
- Students: `student1@demo.com` .. `student4@demo.com` → `/lms/student`

## Project structure

- `src/app/(marketing)` — Home, Courses, Technologies, About, Team, Contact
- `src/app/auth` — single-page Login/Sign Up
- `src/app/lms/student`, `src/app/lms/college` — role-gated LMS dashboards
- `src/app/api` — NextAuth route, registration, contact form
- `src/data` — course curriculum, technologies, team, and contact demo data
- `prisma/schema.prisma` — data model; `prisma/seed.ts` — seed script

## Useful scripts

```bash
npm run build      # production build (also type-checks everything)
npm run lint
npm run db:push    # sync schema.prisma → database
npm run db:seed    # re-run the seed script
npm run db:studio  # browse the database
```

## Open items (see build brief §16 — flagged, not silently invented)

- Robotics and Data Science / AI Fundamentals courses ship with placeholder syllabi — need real content.
- Team/employee data, photos, and CVs are demo placeholders (`src/data/team.ts`).
- Contact-section profiles are demo placeholders (`src/data/contacts.ts`).
- No self-serve enrollment/payment flow — students are assumed to be enrolled by a college admin/trainer.
- Attendance threshold for certification is assumed at 75% (`src/lib/constants.ts`) — confirm the real number.
- Brand logo is a placeholder icon mark built from the brief's description (`src/components/brand/`) —
  no logo files were found in this environment. Drop real logo assets into `public/brand/` and swap them in.
- Production `DATABASE_URL` is not yet set — create a MySQL database in Hostinger's hPanel and set
  the connection string both in `.env` (local) and the Hostinger app's environment variables, then run
  `npx prisma db push` and `npm run db:seed` against it.
