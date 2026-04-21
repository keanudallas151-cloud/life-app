# Life. App — Workspace Rules for Cline

## Before You Start ANY Task

1. Read `AI_PROMPT_HELPER.md` — it is the architecture map of the entire app.
2. Read `implementation_plan.md` — it is the source-of-truth for the finalization pass.
3. Read `implementation_plan_devin.md` (if it exists) — it has 15 detailed work streams.
4. The highest-risk file is `src/App.jsx`. It is the main controller holding auth, routing, state, and most UI logic. Be extremely careful editing it.

## Architecture

- This is a Vite + React 19 single-page app with Supabase for auth and backend.
- There is NO React Router in active use — screen switching is done via state in `src/App.jsx`.
- The app uses a single internal scroll container: `.life-main-scroll`. Never add `overflow` to `body` or `html`. Always scroll `.life-main-scroll`.
- Supabase client is in `src/supabaseClient.js`. It reads `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` from env.

## Styling Rules

- The theme system lives in `src/systems/theme.js`. It exports `C` (colors) and `S` (shadows).
- The app supports light and dark mode. A theme-aware object `t` is computed in `src/App.jsx` at runtime based on the current mode.
- ALWAYS use `t.*` (theme-aware) values for colors in components. Do NOT hardcode color strings.
- If you must use `C.*` (raw palette), only do so in `src/systems/theme.js` itself.
- Global CSS goes in `src/index.css`. Component-scoped overrides go in `src/App.css`.
- Consolidate repeated inline styles into reusable CSS classes rather than duplicating them.
- iOS safe areas must be respected: use `env(safe-area-inset-*)` for bottom nav, app shell, auth surfaces, and dropdowns.

## Mobile-First

- Every UI change must work on screens from 320px to 430px width.
- All buttons and interactive elements must have a minimum 44px touch target.
- Test for overflow, clipping, and scroll traps on small screens.
- The bottom navigation bar must remain fixed and accessible on all screen sizes.

## Component Inventory

- Core shell: `src/App.jsx`, `src/App.css`, `src/index.css`
- Components: `src/components/Reader.jsx`, `QuizPage.jsx`, `PostItFeed.jsx`, `Tailor.jsx`, `Field.jsx`, `AudioPlayer.jsx`, `Charts.jsx`, `Toast.jsx`, `Skeleton.jsx`, `ErrorBoundary.jsx`, `KnowledgeConstellation.jsx`
- Hooks/systems: `src/systems/useUserData.js`, `useQuizStats.js`, `usePostIt.js`, `useSound.js`, `storage.js`, `theme.js`, `resumeReading.js`, `readingStreak.js`
- Data: `src/data/content.js`, `quiz.js`, `posts.js`, `tailoring.js`

## State & Data

- User preferences are stored in localStorage via `src/systems/storage.js`, scoped per user.
- Reading streaks: `src/systems/readingStreak.js`. Resume reading: `src/systems/resumeReading.js`.
- Quiz stats: `src/systems/useQuizStats.js`. PostIt feed: `src/systems/usePostIt.js`.
- Do NOT create new state management systems. Use the existing hooks and helpers.

## Auth Flows

- Google OAuth: `doGoogleSignIn` in `src/App.jsx`
- Email/password: `doEmailSignIn`, `doRegister` in `src/App.jsx`
- Always handle auth errors with user-facing messages. Never silently fail.
- Password show/hide toggles on auth screens must remain aligned, tappable, and visually stable.

## Constraints

- Do NOT add new npm dependencies unless absolutely necessary and explicitly approved.
- Do NOT rewrite `src/App.jsx` from scratch. Make incremental, targeted changes.
- Do NOT remove files without first confirming they are unreferenced (search all imports).
- Preserve all existing fixes for scroll behavior, dark mode, settings, and auth.
- Always run `npm run lint` and `npm run build` before finishing any task.
- The app deploys on Netlify. Config is in `netlify.toml`. Do not break the build.

## Dark Mode

- Dark mode must work on ALL surfaces: sidebar, search, notifications, settings, profile, auth screens, main content, cards, modals, and dropdowns.
- When adding new UI, always define both light and dark variants using the `t.*` theme object.
- Making sure that the texts are visibile when in dark mode.

## Accessibility

- All icon-only buttons need `aria-label`.
- Form inputs need associated `<label>` elements or `aria-label`.
- Images need `alt` text.
- Interactive elements need proper `role` attributes where semantic HTML is insufficient.

## When in Doubt

- Read `src/App.jsx` — it is where most internals meet.
- Check `AI_PROMPT_HELPER.md` for the fastest reading path.
- Follow the patterns already established in the codebase. Consistency over cleverness.
