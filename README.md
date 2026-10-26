# SFIC QC System — Automated QC Sampling & Reporting for State Commodities
## Food, Civil Supplies & Consumer Affairs Department, Gujarat

A full-stack web application for GSCSCL to manage end-to-end QC sampling and reporting workflows for state commodities.

### Tech Stack
- **Frontend & Backend:** Next.js 16 (App Router, TypeScript)
- **Database:** PostgreSQL via Prisma ORM
- **Auth:** NextAuth.js (JWT, role-based)
- **Styling:** Apple Design System (DESIGN.md)

### Quick Start

1. Clone the repo
2. Copy `.env.example` to `.env.local` and fill in your Postgres URL
3. Run:
```bash
npm install --legacy-peer-deps
npx prisma migrate dev --name init
npx prisma db seed
npm run dev
```
4. Open http://localhost:3000

### Demo Accounts
| Role | Email | Password |
|---|---|---|
| Admin | admin@gscscl.gov.in | Admin@123 |
| CGP Branch | cgp.officer@gscscl.gov.in | Branch@123 |
| QC Branch | qc.officer@gscscl.gov.in | QC@Branch123 |
| FRL Field | frl.field@gscscl.gov.in | FRL@Field123 |
| FRL Lab | frl.lab@gscscl.gov.in | FRL@Lab123 |
| Supplier | supplier@agrofresh.in | Supplier@123 |

### Deploy to Vercel
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

Set these environment variables in Vercel:
- `DATABASE_URL` — your Neon/Supabase connection string
- `NEXTAUTH_SECRET` — any random 32-char string  
- `NEXTAUTH_URL` — your Vercel app URL
