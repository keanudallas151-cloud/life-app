# GEMINI.md

Use this file as the fast, practical map for working on **Life.** without breaking the app shell.

## What this app is

- **Stack:** Next.js 16, React 19, Supabase
- **Real entry point:** `app/page.jsx`
- **Real app controller:** `src/App.jsx`
- **Build output:** `dist/`
- **Important reality:** this is mostly a **state-routed single-page app**, not a normal Next.js route tree

## Commands that matter

```bash
npm install
npm run dev
npm run lint
npm run build
npm run start
```

Use `npm run lint` and `npm run build` before considering a change done.

## Read these first

1. `AI_PROMPT_HELPER.md`
2. `app/page.jsx`
3. `src/App.jsx`
4. `src/components/AppShell.jsx`
5. `src/systems/theme.js`
6. `src/systems/storage.js`
7. `src/supabaseClient.js`

If you only open one file, open **`src/App.jsx`**.

## Core architecture

### Routing model

There is **no React Router flow** for the main product UX.

- `screen` in `src/App.jsx` controls top-level states like:
  - `loading`
  - `landing`
  - `signin`
  - `register`
  - `verify_email`
  - `reset_password`
  - `theme_picker`
  - `tailor_intro`
  - `tailor_qs`
  - `tailor_result`
  - `privacy_policy`
  - `terms_conditions`
  - `app`
- `page` controls in-app surfaces like:
  - `home`
  - `reading`
  - `quiz`
  - `postit`
  - `profile`
  - `setting_preferences`
  - `progress_dashboard`
  - `categories`
  - `where_to_start`
  - `networking`
  - `discord_networking`
  - `leaderboard`
  - `daily_growth`
  - `mentorship`
  - `premium`
  - `momentum_hub`
  - `help`
  - `goal_setting`
  - `account_customize`
  - sidebar explainer pages like `sidebar_life`

If you add a new full surface, follow the existing `screen` / `page` pattern instead of introducing a new router system.

### Scroll model

The main app scroll container is **`.life-main-scroll`**.

- Do **not** move primary scrolling to `body` or `html`
- Do **not** add global overflow hacks
- Safe-area spacing and bottom-nav layout are already tuned for mobile/iOS

### App-shell reality

`src/App.jsx` is a high-risk integration file. It currently owns:

- auth restore and auth flow
- onboarding flow
- top-level navigation state
- content selection
- bookmarks, notes, and read progress
- reader integration
- profile/tailoring state
- connections to lazy-loaded pages and shared systems

Make **targeted edits**, not broad rewrites.

## Data and persistence

### Supabase boundary

`src/supabaseClient.js` is the active client setup.

- Canonical env vars:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- Legacy fallback still supported:
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Expected backend tables include:

- `user_data`
- `quiz_stats`
- `posts`
- `comments`
- `post_votes`

Features should degrade safely if env vars or newer columns are missing.

### Local storage pattern

Use `LS` from `src/systems/storage.js` for local persistence.

Existing user-scoped key families include prefixes like:

- `prefs_`
- `bk_`
- `nt_`
- `rd_`
- `tsd_`
- `mom_`
- `notif_`
- `rp_`

When a feature already follows the cloud-or-local pattern, keep using it:

```js
if (userIdForData) {
  // cloud setter
} else {
  // local state + LS.set(...)
}
```

## Styling and UI rules

### Theme usage

In components, use the active theme object `t`.

- Prefer `t.ink`, `t.muted`, `t.green`, `t.white`, `t.border`, etc.
- Do **not** scatter raw color hex values through JSX
- `C` and other palette definitions belong in the theme system, not in ad hoc component styling

### Mobile constraints

- Design mobile-first
- Respect `env(safe-area-inset-*)`
- Keep touch targets at roughly **44px minimum**
- Keep inputs at **16px font size** on mobile to avoid iOS zoom issues

### Tag new pages and major sections

This repo uses `data-page-tag` heavily for traceability and future edits.

Examples already in the repo:

- `#profile`
- `#post_it`
- `#setting_preferences`
- `#momentum_hub`
- `#sidebar_life_page`

When you add a new page or major section, add a clear tag like:

- `#profile_hub`
- `#sidebar_lessons`
- `#lesson_beginner_page`

## Component patterns worth preserving

### Lazy loading

Large app surfaces are centralized in `src/components/AppShell.jsx` and rendered through `Suspense` fallbacks. Keep using that pattern for heavy surfaces.

### Password fields

Use the existing `.life-password-field` and `.life-password-toggle` pattern instead of inventing a new password-toggle layout.

### Icons

Use `Ic.*` from `src/icons/Ic.jsx`.

Example:

```jsx
{Ic.wallet("none", t.green, 20)}
```

## Current repo hotspots

These are the newest changes worth knowing before editing nearby code.

### Current release target: `v0.6.7`

This release batch centers on:

- turning the old Life sidebar shortcuts into a **Browse Life** hub
- expanding `SidebarSectionPage.jsx` into grouped navigation cards for:
  - Where to Start
  - Help
  - Momentum Hub
  - Daily Growth
  - Goals
  - Quiz
- reorganizing `SettingsPage.jsx` so **Account & Data** is split into:
  - Profile & Access
  - Privacy & Legal
  - Progress & Reset
- surfacing current account name/email in settings and linking directly to `account_customize`
- adding this `GEMINI.md` as a practical repo guide instead of generic assistant notes

Files most relevant to this release:

- `src/App.jsx`
- `src/components/SettingsPage.jsx`
- `src/components/SidebarSectionPage.jsx`
- `GEMINI.md`
- `CHANGELOG.md`
- `VERSIONING.md`

## Safe edit rules for this repo

- Do **not** rewrite `src/App.jsx` from scratch
- Do **not** add React Router
- Do **not** move scrolling off `.life-main-scroll`
- Do **not** add another theme system
- Do **not** bypass the existing local/cloud data split
- Do **not** create duplicate page logic when an existing page or shared component can be extended
- Do **not** assume legacy Vite files are the active runtime; they still exist, but Next.js is the real app path

## Best workflow for code changes

1. Read `AI_PROMPT_HELPER.md` and the exact files you plan to touch
2. Check recent git diff if the area looks mid-edit
3. Make the smallest complete change that fits existing patterns
4. Preserve mobile layout, theme usage, and page tags
5. Run:

```bash
npm run lint
npm run build
```

## Bug-hunt map for Life App

If you are searching for bugs or regressions, inspect the app in this order.

### 1. Auth and onboarding

Check:

- session restore
- sign-in and registration flow
- verify email gating
- reset-password flow
- theme picker and tailoring handoff

Main files:

- `src/App.jsx`
- `src/supabaseClient.js`
- `src/components/SignInPage.jsx`
- `src/components/RegisterPage.jsx`
- `src/components/VerifyEmailPage.jsx`
- `src/components/ResetPasswordPage.jsx`
- `src/components/ThemePickerPage.jsx`
- `src/components/Tailor.jsx`

Common bugs:

- wrong `screen` transitions
- auth redirects not returning correctly
- email-confirmation gating skipped
- recovery flow not updating password state correctly

### 2. App shell, sidebar, and top-level navigation

Check:

- sidebar open/close behavior
- bottom nav state
- page switches
- document titles
- notification/search overlays

Main files:

- `src/App.jsx`
- `src/components/BottomNav.jsx`
- `src/components/SidebarSectionPage.jsx`
- `src/index.css`

Common bugs:

- dead buttons after page refactors
- `page` values wired in one place but not another
- overlays clipping on mobile
- active nav states no longer matching current page

### 3. Reader and content flow

Check:

- open topic
- next/previous page
- reading mode
- notes/bookmarks/highlights
- resume reading

Main files:

- `src/components/Reader.jsx`
- `src/data/content.js`
- `src/systems/resumeReading.js`
- `src/systems/readingStreak.js`
- `src/systems/storage.js`

Common bugs:

- reader controls hiding incorrectly
- bottom-nav/full-screen conflicts
- page counters off by one
- bookmark/note persistence mismatches between guest and signed-in states

### 4. Settings, profile, and account surface

Check:

- settings toggles
- account page links
- profile shortcuts
- reset actions
- delete-account handling

Main files:

- `src/components/SettingsPage.jsx`
- `src/components/ProfilePage.jsx`
- `src/App.jsx`

Common bugs:

- settings actions not updating persisted state
- `account_customize` route wired in profile but not settings, or the reverse
- destructive actions not clearing matching local/cloud state

### 5. Quiz, progress, and momentum systems

Check:

- quiz launch
- answer handling
- stats sync
- achievements
- momentum events and dashboard shortcuts

Main files:

- `src/components/QuizPage.jsx`
- `src/components/ProgressDashboardPage.jsx`
- `src/components/MomentumHub.jsx`
- `src/systems/useQuizStats.js`
- `src/systems/momentumEngine.js`
- `src/systems/useMomentum.js`

Common bugs:

- wrong answer evaluation after content updates
- stats not loading for guest vs signed-in users
- dashboard CTAs pointing at stale pages
- momentum events firing twice or not at all

### 6. Social, networking, and community

Check:

- Post-It feed loading
- comments and votes
- networking pages
- leaderboard rendering

Main files:

- `src/components/PostItFeed.jsx`
- `src/systems/usePostIt.js`
- `src/components/ConnectPage.jsx`
- `src/components/LeaderboardPage.jsx`
- `src/data/posts.js`

Common bugs:

- missing Supabase table/column assumptions
- optimistic UI getting out of sync
- page-title mismatches after navigation changes

### 7. Mobile, theming, and CSS regressions

Check:

- widths from `320px` to `430px`
- iOS safe areas
- dark mode
- fixed bottom nav spacing
- no double scroll

Main files:

- `src/index.css`
- `src/App.css`
- `src/App.jsx`
- all auth/page components touched by the change

Common bugs:

- hidden overflow causing clipped content
- fixed chrome overlapping content
- hardcoded colors breaking dark mode
- touch targets shrinking below usable size

### 8. Cloud/local fallback behavior

Always test both:

- signed-in with Supabase configured
- guest/offline/no-env mode

Main files:

- `src/supabaseClient.js`
- `src/systems/useUserData.js`
- `src/systems/useQuizStats.js`
- `src/systems/usePostIt.js`
- `src/systems/storage.js`

Common bugs:

- features working only when signed in
- local fallback diverging from cloud state shape
- missing columns causing runtime errors instead of graceful degradation

## Fast file map

| Purpose | File |
| --- | --- |
| Active entry page | `app/page.jsx` |
| Main app controller | `src/App.jsx` |
| Global CSS | `src/index.css` |
| Main app CSS | `src/App.css` |
| Supabase client | `src/supabaseClient.js` |
| Theme system | `src/systems/theme.js` |
| Local storage helper | `src/systems/storage.js` |
| Main content tree | `src/data/content.js` |
| Quiz data | `src/data/quiz.js` |
| Tailoring data | `src/data/tailoring.js` |
| Lazy-loaded surfaces | `src/components/AppShell.jsx` |

## Useful prompts for Gemini

Use prompts like these when you want Gemini to work with the repo instead of giving generic web-dev advice.

### Understand a surface before editing

```text
Read AI_PROMPT_HELPER.md, app/page.jsx, src/App.jsx, and the files related to [feature/page]. Explain how this part of the app works, what state drives it, and what could break if we change it.
```

### Respect current in-flight work

```text
Check the latest git diff and current unstaged changes before editing [file/feature]. Do not overwrite existing local work. Summarize the active changes first, then make the smallest safe update.
```

### Implement a new page the repo's way

```text
Add a new in-app page for [feature] using the existing screen/page state-routing model in src/App.jsx. Do not add React Router. Reuse the current theme system with t.* values, preserve the .life-main-scroll layout, and add a clear data-page-tag.
```

### Fix a UI bug safely

```text
Investigate and fix [bug] in the existing architecture. Keep the mobile-first layout, preserve safe-area spacing, do not hardcode new colors in JSX, and avoid broad rewrites of src/App.jsx.
```

### Trace data flow

```text
Trace how [bookmarks/notes/read progress/quiz stats/profile state] flows through the app, including cloud vs local persistence. Show which files own the state and where changes should be made.
```

### Review a feature for production readiness

```text
Audit [page/feature] for mobile usability, theme consistency, data-page-tag coverage, safe-area handling, and compatibility with the current Next.js + Supabase setup. Then propose only the highest-value fixes.
```

### Ship a clean change

```text
Make the requested change, keep the code consistent with this repo's patterns, and finish by running npm run lint and npm run build.
```

## Short version

When in doubt:

- open `src/App.jsx`
- keep the `screen` / `page` state-routing model
- use `t.*` theme tokens
- keep scrolling inside `.life-main-scroll`
- preserve `data-page-tag` coverage
- inspect current git changes before editing active UI files
