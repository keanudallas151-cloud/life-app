<!-- markdownlint-disable MD026 -->
# Life.

A production-minded web app for curated reading on money, psychology, and philosophy — with quizzes, notes, bookmarks, profile customization, networking, and a community **Post-It** feed. Built with **Next.js** and **Firebase**, and ready to ship through **Vercel + GitHub**.

## Local development

```bash
npm install
cp .env.example .env.local
# Add the NEXT_PUBLIC_FIREBASE_* values from your Firebase project settings
npm run dev
```

Local repository path on Windows: `C:/Users/louie/life-app`

Branch policy:
- `main` is the working branch for local, cloud, and deployment work.
- `main_backup` is only a backup copy of `main`.

Without env vars the shell still runs, but auth, cloud-synced library data, quiz stats, profile sync, networking, Storage uploads, and Post-It stay offline.

## Vercel + Firebase + GitHub setup

1. Import the GitHub repository into **Vercel** so pushes and pull requests create deployments automatically.
2. In **Vercel → Project Settings → Environment Variables**, add:
   - `NEXT_PUBLIC_FIREBASE_API_KEY`
   - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
   - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
   - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
   - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
   - `NEXT_PUBLIC_FIREBASE_APP_ID`
   - `NEXT_PUBLIC_SITE_URL` (your production origin, for example `https://life.example.com`)
3. In **Firebase Authentication → Settings → Authorized domains**:
   - Add your production Vercel domain.
   - Add `localhost` for local development.
   - Add any preview domains you want to support for sign-in testing.
4. If you deploy Firestore / Storage rules from the repo, use the versioned files in the project root:
   - `firebase.json`
   - `firestore.rules`
   - `firestore.indexes.json`
   - `storage.rules`
5. GitHub Actions runs lint + build on pushes and pull requests, while Dependabot keeps npm packages and GitHub Actions dependencies moving.

## Firebase data model (current)

The app currently uses these Firestore collections:

- `profiles` — shared account profile, avatar, role, onboarding/networking flags
- `userData` — bookmarks, notes, read progress, highlights, momentum state, tailoring profile
- `quizStats` — per-user quiz history and achievements
- `posts`, `comments`, `postVotes` — community feed and voting
- `investorProfiles`, `inventorProfiles`, `swipes`, `conversations`, `blockedUsers`, `reportedProfiles` — networking and messaging

Firebase Storage is used for:

- `profile-avatars/{userId}/...` — account avatars
- `inventors-investors-media/{userId}/...` — networking media uploads

The repo now includes versioned Firestore indexes and security rules for these collections.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Next.js dev server |
| `npm run build` | Production build |
| `npm run start` | Serve the production build locally |
| `npm run lint` | ESLint |
