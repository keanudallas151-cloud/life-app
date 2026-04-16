# Life.

A production-minded web app for curated reading on money, psychology, and philosophy — with quizzes, notes, bookmarks, and a community **Post-It** feed. Built with **Next.js** and **Supabase**, and ready to ship through **Vercel + GitHub**.

## Local development

```bash
npm install
cp .env.example .env
# Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
# from your Supabase project (Settings -> API Keys)
npm run dev
```

Without env vars the shell still runs, but auth, cloud-synced library data, quiz stats, and Post-It stay offline. If you still have the repo's older `VITE_*` env names locally, `next.config.mjs` maps them into the new `NEXT_PUBLIC_*` runtime names during the migration.

## Vercel + Supabase + GitHub setup

1. Import the GitHub repository into **Vercel** so pushes and pull requests create deployments automatically.
2. In **Vercel → Project Settings → Environment Variables**, add:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
   - `NEXT_PUBLIC_SITE_URL` (your production origin, for example `https://life.example.com`)
3. In **Supabase → Authentication → URL Configuration**:
   - Set **Site URL** to the same production origin used in Vercel.
   - Add `http://localhost:3000` to **Redirect URLs** for local auth flows.
   - Add your Vercel production domain and any preview URL wildcard pattern you use for preview deployments.
4. GitHub Actions now runs lint + build on pushes and pull requests, while Dependabot keeps npm packages and GitHub Actions dependencies moving.

## Supabase schema (expected)

The app assumes tables such as `user_data`, `quiz_stats`, `posts`, `comments`, and `post_votes` with RLS appropriate for your security model. The `user_data` record is expected to hold fields like bookmarks, notes, read progress, momentum state, and saved reader highlights. If a table or newer field is missing, the UI degrades as safely as possible (console errors; Post-It shows a clear message when the feed cannot load).

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Next.js dev server |
| `npm run build` | Production build |
| `npm run start` | Serve the production build locally |
| `npm run lint` | ESLint |
