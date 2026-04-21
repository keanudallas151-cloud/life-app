# Life.

A production-minded web app for curated reading on money, psychology, and philosophy — with quizzes, notes, bookmarks, and a community **Post-It** feed. Built with **React (Vite)** and **Supabase** (auth, Postgres, realtime).

## Local development

```bash
npm install
cp .env.example .env
# Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY from your Supabase project (Settings → API)
npm run dev
```

Without env vars the shell still runs, but auth, cloud-synced library data, quiz stats, and Post-It stay offline.

## Deploying on Netlify

1. Connect the repo and set the same `VITE_*` environment variables in **Site configuration → Environment variables**.
2. Build command: `npm run build`, publish directory: `dist` (already set in `netlify.toml`).
3. In **Supabase → Authentication → URL configuration**, add your Netlify URL to **Redirect URLs** and set **Site URL** to match production (needed for OAuth email links and Google sign-in).

## Supabase schema (expected)

The app assumes tables such as `user_data`, `quiz_stats`, `posts`, `comments`, and `post_votes` with RLS appropriate for your security model. If a table is missing, the UI degrades gracefully (console errors; Post-It shows a clear message when the feed cannot load).

## Scripts

| Command        | Description        |
| -------------- | ------------------ |
| `npm run dev`  | Vite dev server    |
| `npm run build`| Production bundle  |
| `npm run preview` | Preview production build |
| `npm run lint` | ESLint             |
