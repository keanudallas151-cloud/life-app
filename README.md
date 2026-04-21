# Life.

A production-minded web app for curated reading on money, psychology, and philosophy — with quizzes, notes, bookmarks, and a community **Post-It** feed. Built with **Next.js** and **Supabase**, and ready to ship through **Vercel + GitHub**.

## Local development

```bash
npm install
cp .env.example .env.local
# Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
# from your Supabase project (Settings -> API Keys)
npm run dev
```

Without env vars the shell still runs, but auth, cloud-synced library data, quiz stats, and Post-It stay offline.

## Renaming your local folder on Windows (`life-app-vite` → `life-app`)

> Do this on your machine only. This repository cannot rename your local folder for you.

### Option A: File Explorer (manual)

1. Save your work in your editor and close VS Code/terminals that are using the repo.
2. Open `C:\Users\louie\`.
3. Right-click `life-app-vite` → **Rename** → `life-app`.
4. Re-open a terminal in `C:\Users\louie\life-app`.

### Option B: PowerShell

```powershell
Move-Item -LiteralPath "C:\Users\louie\life-app-vite" -Destination "C:\Users\louie\life-app"
```

If you get a file-lock error, close apps using that folder and retry.

### Git-safe checks after rename

```powershell
cd "C:\Users\louie\life-app"
git status
git branch --show-current
git remote -v
git log -n 1 --oneline
```

### Continue development after rename

```powershell
cd "C:\Users\louie\life-app"
npm ci
npm run lint
npm run build
npm run dev
```

## Updating repository references (`life-app-vite` text) if needed

There are currently no in-repo `life-app-vite` matches, but use this flow for future cleanup PRs.

### Search

```powershell
Get-ChildItem -Path . -Recurse -Include *.md,*.json,*.yml,*.yaml,*.sh,*.ps1,*.txt -File |
  Select-String -Pattern "life-app-vite" -SimpleMatch
```

### Scoped replace (review diffs before commit)

```powershell
Get-ChildItem -Path . -Recurse -Include *.md,*.json,*.yml,*.yaml,*.sh,*.ps1,*.txt -File |
  ForEach-Object {
    (Get-Content $_.FullName) -replace "life-app-vite", "life-app" | Set-Content $_.FullName
  }
```

### Suggested PR metadata

- **Title:** `Rename repository references from "life-app-vite" to "life-app"`
- **Scope to check:** `README.md`, `package.json`, `.github/*`, `.clinerules/*`, and root docs/scripts.

### Suggested QA checklist

- [ ] `npm ci`
- [ ] `npm run lint`
- [ ] `npm run build`
- [ ] `npm run dev` starts without path errors
- [ ] Re-check `git diff` to confirm only targeted text/reference updates

### Recommended follow-ups outside this repo

- Update local env files, IDE workspace paths, and terminal shortcuts that still point to `life-app-vite`.
- Verify CI/deployment settings that may include old names (GitHub Actions envs, Vercel/Netlify project naming, Docker/container configs).
- Re-open any editor workspaces from the new `C:\Users\louie\life-app` path.

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

The app assumes tables such as `user_data`, `quiz_stats`, `posts`, `comments`, and `post_votes` with RLS appropriate for your security model. The `user_data` record is expected to hold fields like bookmarks, notes, read progress, momentum state, and saved reader highlights. The repo now includes additive Supabase migrations for those core tables.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Next.js dev server |
| `npm run build` | Production build |
| `npm run start` | Serve the production build locally |
| `npm run lint` | ESLint |
