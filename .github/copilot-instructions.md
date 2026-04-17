# Copilot Instructions for `life-app`

## Build, lint, and test commands

- Install dependencies: `npm install` for normal local setup, or `npm ci` to match CI.
- Start local development: `npm run dev`
- Lint the repo: `npm run lint`
- Build for production: `npm run build`
- Run the production build locally: `npm run start`
- Build output goes to `dist/` because `next.config.mjs` sets `distDir: "dist"`.
- There is currently no automated test script or test file pattern configured in `package.json`, so there is no supported single-test command yet.

## High-level architecture

- The active app entry is `app/page.jsx`, not the old Vite shell. It dynamically imports `src/App.jsx` with SSR disabled and wraps the app in `ErrorBoundary` and `ToastProvider`.
- `src/App.jsx` is the main controller for the product. It restores the Supabase session, decides which auth/onboarding/app screen to show, owns most app state, and renders the main app shell when `screen === "app"`.
- Navigation is mostly state-driven inside `src/App.jsx`:
  - `screen` controls auth, onboarding, and top-level app entry states such as `landing`, `signin`, `register`, `theme_picker`, `tailor_*`, and `app`.
  - `page` controls the in-app dashboard surfaces after the user enters the main shell.
  - There is no React Router-based route tree for those flows.
- The shell is mobile-first. `src/App.jsx`, `src/components/BottomNav.jsx`, and `src/index.css` work together to keep the fixed top/bottom chrome and the main scroll area aligned on small screens and iOS safe-area devices.
- App content is largely data-driven:
  - `src/data/content.js` holds the main reading library and related metadata.
  - `src/data/quiz.js`, `src/data/posts.js`, and `src/data/tailoring.js` back the quiz, community, and onboarding flows.
- Supabase is the backend boundary:
  - `src/supabaseClient.js` creates the client and uses `NEXT_PUBLIC_SUPABASE_URL` plus `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` as the canonical env vars.
  - Legacy `NEXT_PUBLIC_SUPABASE_ANON_KEY` and `VITE_*` public names are still supported as migration fallbacks.
  - `src/systems/useUserData.js`, `useQuizStats.js`, and `usePostIt.js` are the main cloud-sync hooks for profile/library state, quiz stats, and the Post-It feed.
- The repo still contains legacy Vite-era files (`src/main.jsx`, `index.html`, `vite.config.js`), but `npm run dev` / `npm run build` use Next.js.
- `app/layout.jsx` injects global CSS plus additional public asset files such as `password-toggle-fix.*` and `home-hero-polish.*`, so auth and home-page polish sometimes spans both React code and `public/` assets.
- Some UI polish is done by DOM-patching scripts in `public/`, not only React components. If a password toggle or home hero change looks like it should already work, check those files before assuming the React tree is the only source of behavior.

## Key conventions

- Treat `src/App.jsx` as a high-risk integration file. Prefer targeted edits and reuse existing hooks/components instead of adding another top-level state system.
- Keep the current state-routing model. If you need a new auth/onboarding/dashboard surface, follow the existing `screen` / `page` pattern instead of introducing React Router.
- Preserve the single main scroll container: `.life-main-scroll` inside the app shell. Do not move primary scrolling onto `body` or `html`.
- Respect the mobile shell constraints already encoded in `src/index.css`: iOS safe-area padding is used widely, the bottom nav stays fixed, and many controls enforce a 44px minimum touch target. New full-screen surfaces should follow those same spacing and tap-target rules.
- Reuse the theme system from `src/systems/theme.js`:
  - `useTheme()` returns the active theme object as `t`.
  - In components, prefer `t.*` theme values instead of hardcoded colors.
  - `C`/`DARK` are palette definitions and shared tokens, not a cue to introduce new ad hoc color values throughout the app.
- Reuse the `LS` helper in `src/systems/storage.js` for local persistence. Existing user-scoped keys in `src/App.jsx` use prefixes like `prefs_`, `bk_`, `nt_`, `rd_`, `tsd_`, `mom_`, `notif_`, and `rp_`; follow those patterns instead of inventing a second storage scheme.
- Supabase-aware features are expected to degrade without crashing when env vars or newer columns are missing. Existing hooks already contain fallback behavior for guest mode and some legacy schema differences; extend those patterns rather than bypassing them.
- Lazy-loaded app surfaces are centralized in `src/components/AppShell.jsx` and rendered through `Suspense` fallbacks from `src/App.jsx`. Keep that pattern when splitting large surfaces out of the main controller.
- For orientation, `AI_PROMPT_HELPER.md` is the repository’s best short architecture map and is worth checking before large refactors.


# Copilot Instructions — Life. App

## Project Overview
Life. is a **Next.js 15 + React 19 + Supabase** educational web app covering Finance, Psychology, Philosophy, and Business. It is a single-page app where routing is handled via **React state** (not Next.js routing). The entry point is `app/page.jsx` → `src/App.jsx`.

---

## Stack & Key Files

| Layer | File/Path |
|---|---|
| App shell & all logic | `src/App.jsx` — DO NOT rewrite from scratch |
| Global styles | `src/index.css` |
| Component styles | `src/App.css` |
| Supabase client | `src/supabaseClient.js` |
| Theme tokens | `src/systems/theme.js` — exports `C` (colors) and `S` (shadows) |
| Local storage helpers | `src/systems/storage.js` — exports `LS` |
| Content data | `src/data/content.js` |
| Quiz data | `src/data/quiz.js` |
| Tailoring logic | `src/data/tailoring.js` |
| User cloud data hook | `src/systems/useUserData.js` |
| Quiz stats hook | `src/systems/useQuizStats.js` |
| PostIt feed hook | `src/systems/usePostIt.js` |
| Momentum engine | `src/systems/momentumEngine.js` + `useMomentum.js` |
| Reading streak | `src/systems/readingStreak.js` |
| Resume reading | `src/systems/resumeReading.js` |
| Sound hook | `src/systems/useSound.js` |
| Icon library | `src/icons/Ic.jsx` |
| Lazy-loaded components | `src/components/AppShell.jsx` |

---

## Architecture Rules

### Routing
- There is **NO React Router**. All screen switching uses `setScreen()` and `setPage()` state in `src/App.jsx`.
- Screens: `loading`, `landing`, `signin`, `register`, `verify_email`, `reset_password`, `tailor_intro`, `tailor_qs`, `tailor_result`, `privacy_policy`, `terms_conditions`, `app`
- Pages (within `app` screen): `home`, `reading`, `quiz`, `postit`, `profile`, `setting_preferences`, `progress_dashboard`, `categories`, `where_to_start`, `networking`, `leaderboard`, `daily_growth`, `mentorship`, `premium`, `momentum_hub`, `help`

### Scroll Container
- The **only** scroll container is `.life-main-scroll` (ref: `mainScrollRef`).
- **Never** add `overflow` to `body` or `html`.
- Scroll resets use `mainScrollRef.current.scrollTo({ top: 0 })`.

### State & Data
- User data (bookmarks, notes, readKeys, tsdProfile, momentumState) is either:
  - **Cloud** via `useUserData(userId)` when Supabase is configured and user is logged in
  - **Local** via `LS` (localStorage) when guest or no Supabase
- The pattern for every setter: check `userIdForData` first, then fall back to local state + `LS.set()`.

### Styling Rules
- **Always** use `t.*` (theme-aware object computed from `useTheme()`) for colors in components.
- **Never** hardcode color hex strings in component JSX — use `t.green`, `t.ink`, `t.muted`, etc.
- Raw palette `C.*` values are only for `src/systems/theme.js` itself.
- Dark mode is toggled via `body.life-dark` class and `t` switches between light/dark palettes.
- Shared CSS classes go in `src/index.css`. Component-scoped overrides in `src/App.css`.

### Mobile / iOS
- Minimum touch target: **44px**.
- Always respect iOS safe areas: `env(safe-area-inset-*)`.
- Test widths: 320px → 430px.
- Bottom nav height is `--life-bottom-nav-height` CSS variable.
- All `input`, `textarea`, `select` must be `font-size: 16px` on mobile to prevent iOS zoom.

---

## Component Conventions

### Password Toggle Buttons
Always use this pattern inside a `.life-password-field` wrapper:
```jsx
<div className="life-password-field">
  <input type={show ? "text" : "password"} ... />
  <button className="life-password-toggle" type="button" data-password-toggle="true"
    aria-label={show ? "Hide password" : "Show password"}
    onClick={() => setShow(v => !v)}>
    <span className="life-password-toggle-label">{show ? "Hide" : "Show"}</span>
  </button>
</div>
```

### Lazy Loading
Heavy components are lazy-loaded via `React.lazy` in `src/components/AppShell.jsx`:
- `EbookReader`, `QuizPage`, `PostItFeed`, `TailorIntro`, `TailorQuestions`, `TailorResult`, `MomentumHubPage`
- Always wrap with `<Suspense fallback={<RouteFallback />}>`.

### Icons
Use `Ic.iconName("none", color, size)` from `src/icons/Ic.jsx`. Example:
```jsx
{Ic.wallet("none", t.green, 20)}
```

---

## Supabase

### Tables Used
- `user_data` — bookmarks, notes, read_keys, tsd_profile, momentum_state
- `quiz_stats` — quiz history and achievements
- `posts` — PostIt feed posts
- `comments` — PostIt comments
- `post_votes` — votes (upserted with `onConflict: "user_id,post_id"`)

### Auth Flows (all in `src/App.jsx`)
- `doGoogleSignIn()` — OAuth redirect
- `doEmailSignIn()` — email + password
- `doRegister()` — sign up with name, email, DOB, password
- `doForgotPassword()` — reset email
- `doResetPassword()` — update password after recovery
- `doSignOut()` — sign out

### Auth Rules
- Always check `session.user.email_confirmed_at` before granting app access.
- If not confirmed → `setScreen("verify_email")`.
- Password recovery uses `passwordRecoveryRef` to track the flow.
- New users are routed to `tailor_intro` if `!onboarded && !hasReadContent && !hasBookmarks`.

---

## Build & Config

- **Build command**: `npm run build` (Next.js)
- **Output directory**: `dist` (set via `distDir: "dist"` in `next.config.mjs`)
- **Vercel config** (`vercel.json`): `outputDirectory: "dist"`, `framework: "nextjs"`
- **ESLint**: `next lint` — uses `eslint-config-next`
- Only one config file should exist: **`next.config.mjs`** (delete `next.config.js` if it appears)
- The app also has a legacy `vite.config.js` and `index.html` — these are for local Vite dev only and are not used by the Next.js build.

---

## Constraints — Never Do These

- ❌ Do NOT rewrite `src/App.jsx` from scratch — make targeted edits only
- ❌ Do NOT add new npm dependencies unless absolutely necessary
- ❌ Do NOT add `overflow` to `body` or `html`
- ❌ Do NOT use React Router (it is unused and may be removed)
- ❌ Do NOT hardcode `C.*` colors in JSX — use `t.*` theme values
- ❌ Do NOT create both `next.config.js` and `next.config.mjs` — use only `.mjs`
- ❌ Do NOT add `distDir` anywhere except `next.config.mjs`
- ❌ Do NOT commit `.env` or expose service_role keys

---

## Common Patterns

### Adding a new page
1. Add the page name to the `page` state type (comment in App.jsx)
2. Add a `{page === "my_page" && ( ... )}` block inside the main content area
3. Add navigation to it via `setPage("my_page")` somewhere (sidebar, bottom nav, etc.)
4. Update the `titles` object in the `useEffect` that sets `document.title`

### Adding a new setting toggle
```jsx
<label style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:10 }}>
  <div>
    <p style={{ margin:0, fontSize:14, fontWeight:700, color:t.ink }}>Setting Label</p>
    <p style={{ margin:"3px 0 0", fontSize:12, color:t.muted }}>Description</p>
  </div>
  <input type="checkbox" checked={!!uiPrefs.myPref}
    onChange={e => updateUiPrefs({ myPref: e.target.checked })}
    style={{ width:20, height:20, accentColor:t.green }} />
</label>
```

### Saving to cloud or local
```js
const setMyData = (v) => {
  const next = typeof v === "function" ? v(myData) : v;
  if (userIdForData) cloud.setMyData(next);
  else {
    setLocalMyDataRaw(next);
    LS.set(`mydata_${uid}`, next);
  }
};
```
## always adding a tag in every page made for instance
- new page (#profile_hub) or if made a new page for lessons, do the location to where you will find "lessons" in this case, (#sidebar_lessons). If i were to make a "lesson" section and inside is diffrent difficuty i would just to make sure that we can easily find the code related to a specific section or page when we need to edit it again in the future, and also to make sure that we are not creating duplicate code for diffrent sections or pages.
---
## Validation Checklist Before Any Commit
- [ ] `npm run lint` passes
- [ ] `npm run build` succeeds and outputs to `dist/`
- [ ] No hardcoded color strings in JSX
- [ ] Universal mobile layout
- [ ] add dependecies only if you really need to, and think will be usefull
- [ ] `src/App.jsx` was edited incrementally, not rewritten
