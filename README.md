# KREW — Find your people. Move together.

Responsive website that matches people nearby by activities, goals, fitness level, schedule, location and matching preferences — built from the KREW Scope of Work and approved UI reference.

---

## 1. Project overview

The 12-step website workflow from the Scope of Work (§12.4):

| # | Screen | Route |
|---|---|---|
| 01 | Landing page | `/` |
| 02 | Sign up / Log in (email + password, Google, optional Apple) | `/auth?mode=signup` · `/auth?mode=login` |
| 03 | Location setup (pincode → map → travel radius → travel time) | `/onboarding/location` |
| 04 | Select activities (+ custom "Other") | `/onboarding/activities` |
| 05 | Goals (max 2, + custom), fitness level, schedule | `/onboarding/goals` |
| 06 | Matching preferences (Same gender / No preference, contact approval) | `/onboarding/preferences` |
| 07 | Create profile (name, DOB → age, gender, optional photo & bio, contact details) | `/onboarding/profile` |
| 08 | Home / Discover (cards, match %, distance + travel time, filters, Skip/Connect) | `/discover` |
| 09 | View profile | `/people/[id]` |
| 10 | Connection request sent | dialog on Discover / Profile |
| 11 | Incoming requests (accept / decline), sent requests | `/requests` |
| 12 | Match & connect (contact details) | `/match/[id]` |

Plus: connections list (`/connections`), profile management (`/account`, each section edits via `/onboarding/<step>?edit=1`), password reset, Terms/Privacy, 404/error/loading states.

### Matching logic (provisional — to be confirmed by client, SoW §6/§10)

Candidates must: have completed onboarding, pass **mutual** gender preference, be within **both** users' travel radius (1–2 km → 2 km, 2–5 km → 5 km, 5+ km → capped at 25 km), not be skipped in the last 30 days, and have no live/declined connection.

Match % (SQL function `public._compat_score`):

| Factor | Weight |
|---|---|
| Activity overlap (incl. custom activities) | 40 |
| Goal overlap (incl. custom goals) | 20 |
| Fitness level (same = full, adjacent = half) | 15 |
| Schedule overlap | 15 |
| Proximity within radius | 10 |

Change the weights in that one function via a new migration.

**Contact sharing:** if the recipient chose "Yes, ask me first", contacts are shared only after they accept. If they chose "I'm comfortable sharing", a request is accepted automatically. Contacts are only readable through `get_match` for accepted connections. Exact coordinates, pincode and DOB are never exposed to other users.

**Travel time** is an estimate (≈18 km/h urban average + 2 min, `lib/travel.ts`) — no paid routing API required. **Geocoding** uses OpenStreetMap Nominatim via a server route (`lib/geo/provider.ts`, swappable).

## 2. Tech stack

- **Next.js 16** (App Router, Server Components, Server Actions, `proxy.ts`), **React 19**, **TypeScript**
- **Tailwind CSS v4**, self-hosted Archivo variable font, lucide icons
- **Supabase**: Auth (email/password, Google OAuth), Postgres with Row Level Security, Storage (avatars), SQL RPCs for matching/connections — via `@supabase/ssr`
- **Zod** validation, **Vercel** hosting

## 3. Folder structure

```
app/
  page.tsx                 Landing
  auth/                    Sign up/login, callback, forgot/reset password, error
  onboarding/              5 onboarding steps + server actions
  (app)/                   Signed-in area (layout guards auth + onboarding)
    discover/ people/[id]/ requests/ connections/ match/[id]/ account/
    actions.ts             connect / skip / respond / cancel
  (legal)/terms, privacy
  api/geocode/route.ts     Pincode → coordinates (auth required)
  robots.ts sitemap.ts manifest.ts icon.png opengraph-image.jpg
components/                ui/, brand/, auth/, onboarding/, discover/, people/, connections/, match/, nav/, profile/, marketing/
lib/                       env, site-url, supabase clients, auth, onboarding, validation, constants, travel, geo, errors
types/                     database.ts (Supabase types), app.ts
supabase/migrations/       20260927101026_init_schema.sql, 20260927101136_init_functions.sql
proxy.ts                   Session refresh + route protection
public/brand/              Logo assets
```

## 4. Local setup

Requirements: Node.js ≥ 20.9, npm, a Supabase project (free tier is fine).

```bash
npm install
cp .env.example .env.local      # then fill in values (section 5)
# apply the database migration (section 7)
npm run dev                      # http://localhost:3000
```

Other scripts: `npm run lint`, `npm run typecheck`, `npm run build`, `npm start`.

## 5. Environment variables

| Variable | Required | Example | Notes |
|---|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | `https://abcd1234.supabase.co` | Supabase → Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Yes | `sb_publishable_…` | Publishable key (legacy anon key also works). Safe in the browser — RLS protects data |
| `NEXT_PUBLIC_SITE_URL` | Yes (prod) | `https://krew.vercel.app` | No trailing slash. Used for auth redirects, metadata, sitemap |
| `NEXT_PUBLIC_ENABLE_APPLE_SIGNIN` | No | `false` | `true` shows the Apple button (configure Apple in Supabase first) |

No service-role key is needed. `VERCEL_URL`/`VERCEL_ENV` are provided by Vercel automatically; preview deployments use their own URL.

## 6. Supabase setup

1. Create a project at <https://supabase.com/dashboard> (choose the Mumbai region `ap-south-1` for Indian users).
2. **Project Settings → API**: copy the Project URL and publishable key into `.env.local`.
3. **Authentication → Sign In / Providers → Email**: enabled. "Confirm email" on (recommended) — users confirm then land in onboarding.
4. **Authentication → URL Configuration**:
   - **Site URL**: `http://localhost:3000` for now (change to production URL later — section 12).
   - **Redirect URLs** (add all):
     ```
     http://localhost:3000/**
     https://<your-project>.vercel.app/**
     https://*-<your-vercel-team-slug>.vercel.app/**
     ```
5. Apply the migration (section 7). It creates tables, RLS policies, functions, seed activities/goals and the public `avatars` storage bucket.
6. *(Recommended for production)* **Authentication → Emails → SMTP**: configure a custom SMTP provider — Supabase's built-in email is rate-limited and meant for testing.
7. *(Optional)* Make yourself admin: SQL editor → `insert into public.user_roles (user_id, role) values ('<your-auth-user-id>', 'admin');`

## 7. Database migrations

**Option A — Supabase CLI (recommended)**
```bash
npm install -g supabase            # or: npx supabase <cmd>
supabase login
supabase link --project-ref <project-ref>
supabase db push                    # applies supabase/migrations/*.sql
npm run db:types                    # optional: regenerate types to types/database.generated.ts
```

**Option B — Dashboard**: open **SQL Editor** and run, in order, `supabase/migrations/20260927101026_init_schema.sql` then `20260927101136_init_functions.sql`.

> The connected Supabase project `xtrcerjdclrtinjlobov` already has both migrations applied.

Future changes: `supabase migration new <name>`, write SQL, `supabase db push`. Never edit an applied migration.

## 8. Google OAuth setup

1. <https://console.cloud.google.com> → create/select a project.
2. **APIs & Services → OAuth consent screen**: External; app name "KREW"; support email; authorised domain `supabase.co` (and your custom domain later); scopes `email`, `profile`, `openid`. Publish the app when ready (testing mode limits to test users).
3. **Credentials → Create credentials → OAuth client ID → Web application**:
   - Authorised JavaScript origins: `http://localhost:3000`, `https://<your-project>.vercel.app` (+ custom domain later)
   - Authorised redirect URI: `https://<project-ref>.supabase.co/auth/v1/callback`
4. Copy Client ID + Client Secret → Supabase **Authentication → Sign In / Providers → Google** → enable, paste, save.

No code change is needed — the "Continue with Google" button works once the provider is enabled. Until then, clicking it shows a friendly error.

## 9. GitHub

```bash
git init
git add .
git commit -m "KREW: initial website"
git branch -M main
git remote add origin https://github.com/<you>/krew.git
git push -u origin main
```
`.env.local` is ignored; only `.env.example` is committed.

## 10. Vercel deployment

**Dashboard**
1. <https://vercel.com/new> → Import the GitHub repo. Framework: Next.js (auto). Build `next build`, install `npm install` (defaults).
2. Add environment variables (section 11) for **Production** and **Preview**.
3. Deploy. Then set `NEXT_PUBLIC_SITE_URL` to the assigned `https://<project>.vercel.app` if not already, and redeploy.
4. Add that URL to Supabase Redirect URLs and set it as Supabase **Site URL**; add it to Google authorised origins.

**CLI**
```bash
npm i -g vercel
vercel login
vercel link
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY production
vercel env add NEXT_PUBLIC_SITE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_URL preview
vercel env add NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY preview
vercel deploy            # preview
vercel deploy --prod     # production
```
Pushes to `main` deploy to production automatically; other branches/PRs get preview URLs.

## 11. Production environment variables (Vercel)

| Variable | Production | Preview |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | ✅ |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | ✅ | ✅ |
| `NEXT_PUBLIC_SITE_URL` | ✅ `https://<project>.vercel.app` | not needed (uses the preview URL) |
| `NEXT_PUBLIC_ENABLE_APPLE_SIGNIN` | optional | optional |

`NEXT_PUBLIC_*` values are inlined at build time — **redeploy after changing them**.

## 12. Switching to a custom domain

1. Vercel → Project → **Settings → Domains** → add `krew.example.com`, set the DNS records shown.
2. Vercel env: `NEXT_PUBLIC_SITE_URL=https://krew.example.com` → redeploy.
3. Supabase → URL Configuration: **Site URL** = `https://krew.example.com`; add `https://krew.example.com/**` to Redirect URLs (keep the vercel.app entry until switched).
4. Google Cloud: add `https://krew.example.com` to authorised JavaScript origins and the domain on the consent screen. (The redirect URI stays the Supabase one.)
5. Update `CONTACT_EMAIL` in `lib/site.ts`.

No other code changes — nothing references a hardcoded domain.

## 13. Troubleshooting

| Symptom | Fix |
|---|---|
| "Supabase is not configured" / redirect loop to home | Env vars missing — check `.env.local` or Vercel env, then restart dev / redeploy |
| Email confirm or Google login lands on wrong URL / `redirect_to` ignored | Add the exact origin with `/**` to Supabase Redirect URLs; check `NEXT_PUBLIC_SITE_URL` |
| Google: `redirect_uri_mismatch` | Google redirect URI must be `https://<project-ref>.supabase.co/auth/v1/callback` |
| Google button shows "provider is not enabled" | Enable Google in Supabase Auth Providers (section 8) |
| "Email rate limit exceeded" | Configure custom SMTP in Supabase |
| Onboarding save errors / `relation does not exist` | Migration not applied — section 7 |
| Pincode not found | Nominatim has no data for that code; use "Use my current location" or pick a nearby pincode |
| Discover is empty | You're the only user nearby — create a second account in another browser with overlapping radius |
| Profile photos don't load | Check `NEXT_PUBLIC_SUPABASE_URL` at build time (image domain allow-list) and that the `avatars` bucket exists |
| Build fails on types after DB change | Regenerate with `npm run db:types` and update `types/database.ts` |
