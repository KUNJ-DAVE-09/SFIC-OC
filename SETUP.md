## 🗄️ Database Setup Guide — SFIC QC System

### Option A: Neon (Recommended — free, instant)

1. Go to → https://neon.tech  
2. Sign up free → Create Project → name it `sfic-qc`
3. Copy the **Connection string** — looks like:
   ```
   postgresql://sfic_owner:XXXX@ep-xxx.us-east-2.aws.neon.tech/sficqc?sslmode=require
   ```
4. Open `sfic-qc/.env.local` and replace `DATABASE_URL`:
   ```
   DATABASE_URL="postgresql://sfic_owner:XXXX@ep-xxx.us-east-2.aws.neon.tech/sficqc?sslmode=require"
   NEXTAUTH_SECRET="sfic-qc-super-secret-2026"
   NEXTAUTH_URL="http://localhost:3000"
   ```

---

### Option B: Supabase (also free)

1. Go to → https://supabase.com  
2. New Project → name it `sfic-qc`
3. Settings → Database → **Connection string → URI** tab  
4. Replace `[YOUR-PASSWORD]` with your project password, paste into `.env.local`

---

### Option C: Local PostgreSQL (Windows)

1. Download from → https://www.postgresql.org/download/windows/
2. Install with default settings, set password `postgres`
3. Your `.env.local` already has the right string — no change needed

---

## ▶️ Run after DB is set up

Open terminal in `sfic-qc/` folder and run these 3 commands:

```bash
# Step 1 — Create all tables in your database
npx prisma migrate dev --name init

# Step 2 — Load demo data (users, sample offers, lab records)
npx prisma db seed

# Step 3 — Start the website
npm run dev
```

Open browser → **http://localhost:3000**

---

## 🔑 Demo Login Accounts

| Role | Email | Password |
|---|---|---|
| **Admin** (full view) | admin@gscscl.gov.in | Admin@123 |
| **CGP Branch** | cgp.officer@gscscl.gov.in | Branch@123 |
| **QC Branch** | qc.officer@gscscl.gov.in | QC@Branch123 |
| **FRL Field Staff** | frl.field@gscscl.gov.in | FRL@Field123 |
| **FRL Laboratory** | frl.lab@gscscl.gov.in | FRL@Lab123 |
| **Supplier** | supplier@agrofresh.in | Supplier@123 |

---

## 🌐 Deploy to production (optional)

### Vercel (free, 1-click)
```bash
npm install -g vercel
vercel
```
Add these environment variables in Vercel dashboard:
- `DATABASE_URL` → your Neon/Supabase connection string
- `NEXTAUTH_SECRET` → any random 32-char string
- `NEXTAUTH_URL` → your Vercel app URL e.g. `https://sfic-qc.vercel.app`

### Railway (includes free Postgres)
→ https://railway.app — deploy repo + add Postgres plugin — `DATABASE_URL` auto-wired.
