# Implementation Plan
 
[Overview]
 
Finalize the Life. app into a cleaner, more stable, more polished production-ready experience by building on the fixes already present in the working tree.
 
This plan is the source-of-truth blueprint for the next full finalization pass on the Life. app. The goal is to build on the fixes already present in the working tree, not restart from scratch. The app already has meaningful progress on password-toggle cleanup, internal scroll-container fixes, settings regrouping, and initial dark-mode normalization. The remaining work is to finish those improvements cleanly, harden the main product flows, and remove stale technical debt that is still creating inconsistency and maintenance risk.
 
Primary outcomes for the implementation pass:
 
1. Finalize `.life-main-scroll` as the canonical in-app scroll container.
2. Make page and screen transitions consistently reset the internal scroller.
3. Keep the scroll-to-top button fully tied to the internal scroller instead of `window`.
4. Remove remaining mobile scroll traps, clipped panels, and shallow-scroll regressions.
5. Preserve iOS-safe-area behavior for the app shell, bottom nav, auth surfaces, and dropdowns.
6. Keep sign-in and register password show/hide controls aligned, tappable, and visually stable.
7. Remove obsolete password-toggle workaround assets if they are confirmed unused.
8. Finish auth-screen mobile sizing and touch-target polish.
9. Normalize high-traffic surfaces from hardcoded `C.*` values toward theme-aware `t.*` values or reusable CSS classes.
10. Close dark-mode gaps across sidebar, search, notifications, settings, profile, auth, and main content surfaces.
11. Reduce visual drift caused by inline-style duplication in `src/App.jsx`.
12. Consolidate repeated surface, spacing, and card rules into reusable CSS where practical.
13. Finish reorganizing the settings page into clear, labeled sections.
14. Keep quick presets (`focus`, `immersive`, `calm`) but make their purpose clearer.
15. Remove duplicated or confusing settings/profile controls.
16. Improve settings action labels, grouping, and section hierarchy.
17. Keep profile/tailoring flows aligned with settings defaults and personalization state.
18. Harden search and notification overlay bounds on smaller screens.
19. Preserve earlier card-height and responsive fixes already added in `src/index.css`.
20. Keep offline and missing-Supabase states usable and clearly messaged.
21. Harden Post-It empty/error/loading states and interaction feedback.
22. Preserve optimistic voting correctness and comment integrity in the Post-It feed.
23. Polish Quiz page spacing, stats readability, timer visuals, and mobile ergonomics.
24. Polish Reader notes/share/pagination behavior and theme consistency.
25. Protect resume-reading and reading-streak flows while UI cleanup is happening.
26. Audit `public/home-hero-polish.js` and reduce its responsibility where possible.
27. Resolve the `src/App.css` merge-conflict artifact.
28. Audit `react-router-dom` usage and remove it only if it remains truly unused.
29. Remove stale workaround files only after confirming they are not referenced anywhere.
30. Normalize global theme side effects currently being injected from `src/systems/theme.js`.
31. Avoid adding new dependencies unless a blocker makes them necessary.
32. Validate with `npm run lint`, `npm run build`, and targeted manual smoke testing.
33. Leave the repo in a cleaner, more maintainable state than the current monolithic baseline.
 
Implementation constraints:
 
- Treat the current working tree as the baseline because several fixes already exist and should not be accidentally reverted.
- Prefer incremental extraction/cleanup over a risky full rewrite of `src/App.jsx`.
- Do not introduce routing as a major architecture change during this pass unless it becomes absolutely necessary.
- Keep Supabase-dependent logic backward compatible with current env-driven behavior.
- Prefer CSS and small React helper extraction over additional DOM patching in `public/` scripts.
 
[Types]
 
The implementation should preserve the existing JavaScript data contracts while making their responsibilities and compatibility expectations explicit.
 
This codebase is JavaScript-first, so the “types” below are data contracts to preserve during cleanup rather than a requirement to migrate to TypeScript.
 
- `AppScreen`
  - Existing top-level screen state in `src/App.jsx`.
  - Includes flows such as loading, landing, sign-in, register, tailoring, and main app shell states.
 
- `AppPage`
  - Existing in-app page state in `src/App.jsx`.
  - Includes sections such as home, quiz, post-it, reading, profile, and settings subpages.
 
- `ThemeTokens`
  - Current theme object produced by `useTheme()`.
  - Must continue to expose light/dark-aware surface, text, border, and accent values used by the app shell.
 
- `UiPrefs`
  - User preference payload seeded by `PREF_DEFAULTS` and stored per user/local session.
  - Must remain backward compatible with existing saved preference objects.
 
- `TailorProfile`
  - Personalization object derived from `buildProfile(answers)` in `src/data/tailoring.js`.
  - Used for tailored recommendations and settings/profile behavior.
 
- `UserShape`
  - Normalized auth/user object shaped inside `src/App.jsx` from Supabase user data.
  - Must continue to support auth UI, profile UI, and cloud sync hooks.
 
- `UserDataRecord`
  - Cloud-backed payload managed by `useUserData(userId)`.
  - Includes bookmarks, notes, read keys, and personalization-related data.
 
- `QuizStatsRecord`
  - Local/cloud quiz statistics managed through `useQuizStats(userId)`.
  - Must preserve the `fromDB` / `toDB` mapping contract.
 
- `PostRecord`, `CommentRecord`, `VoteRecord`
  - Post-It feed shapes normalized by `shapePosts(rows, commentsMap, votesMap)` and consumed by `PostItFeed.jsx`.
  - Must preserve optimistic updates and realtime echo safeguards.
 
- `ReaderResumeState`
  - Resume-reading object handled through `resumeReading.js` and reader page persistence.
 
- `ReadingStreakState`
  - Local streak contract managed through `readingStreak.js`.
 
- `ToastItem`
  - Existing notification payload managed by `ToastProvider`.
  - Should remain unchanged unless a UI issue requires additional metadata.
 
[Files]
 
The implementation will primarily modify existing app-shell, styling, feature, and cleanup files while adding no new runtime architecture beyond the plan and handoff artifacts.
 
- `src/App.jsx`
  - Highest-priority implementation file.
  - Finish scroll-container behavior, continue theme normalization, reduce repeated inline styling in critical flows, clean up settings/profile structure, and stabilize auth/app shell behavior.
 
- `src/index.css`
  - Main styling consolidation file.
  - Continue shared classes for auth fields, scroll behavior, safe-area handling, cards, settings/profile layouts, dark-mode overrides, and responsive fixes.
 
- `src/App.css`
  - Resolve conflict markers immediately.
  - If the file remains unused, either delete it or replace it with a clean intentional stub so the repo no longer contains merge debris.
 
- `src/systems/theme.js`
  - Keep design tokens, but audit the document-level style injection side effect.
  - Move global styling responsibility into CSS if feasible during the pass.
 
- `src/supabaseClient.js`
  - Preserve graceful fallback behavior when env vars are missing.
  - Make sure implementation changes do not break offline/degraded mode.
 
- `src/systems/useUserData.js`
  - Preserve debounced persistence and user-scoped sync behavior while surrounding UI is cleaned up.
 
- `src/systems/usePostIt.js`
  - Preserve optimistic voting, realtime sync, and error handling while improving feed UX.
 
- `src/systems/useQuizStats.js`
  - Preserve DB mapping and upsert behavior while quiz UI is refined.
 
- `src/systems/storage.js`
  - Keep backwards-compatible localStorage behavior during settings/theme cleanup.
 
- `src/systems/readingStreak.js`
  - Preserve streak calculations and ensure dashboard/profile cards keep working.
 
- `src/systems/resumeReading.js`
  - Preserve continue-reading behavior while home/reader flows are polished.
 
- `src/components/Reader.jsx`
  - Improve theme consistency, notes/share ergonomics, link-copy behavior, and mobile interaction quality.
 
- `src/components/PostItFeed.jsx`
  - Improve loading/empty/error states, compose spacing, voting affordances, and smaller-screen layout behavior.
 
- `src/components/QuizPage.jsx`
  - Improve readability, spacing, achievement/stat presentation, and mobile resilience.
 
- `src/components/Tailor.jsx`
  - Keep onboarding/profile handoff clear and aligned with updated settings/profile organization.
 
- `src/components/KnowledgeConstellation.jsx`
  - Verify it still fits theme and responsiveness expectations if touched by global style changes.
 
- `src/components/Toast.jsx`
  - Confirm toasts still sit correctly above mobile UI chrome and do not clash with dark mode.
 
- `src/components/ErrorBoundary.jsx`
  - Keep as-is unless styling or recovery messaging needs a small polish pass.
 
- `index.html`
  - Verify PWA/iOS meta tags, manifest usage, theme colors, and public asset references.
  - Confirm password-toggle workaround assets remain unreferenced before deleting them.
 
- `public/home-hero-polish.js`
  - Preserve the existing `requestAnimationFrame` throttling.
  - Reduce DOM mutation scope or document why the script still needs to exist.
 
- `public/home-hero-polish.css`
  - Keep only if still necessary after React/CSS-side cleanup.
 
- `public/password-toggle-fix.css`
  - Delete if fully obsolete.
 
- `public/password-toggle-fix.js`
  - Delete if fully obsolete.
 
- `package.json`
  - Audit `react-router-dom` and keep dependencies aligned with real usage.
 
- `README.md`
  - Optional minor follow-up if cleanup changes setup/runtime assumptions.
 
- `AI_PROMPT_HELPER.md`
  - Optional follow-up if the architecture map should reflect any meaningful cleanup or file deletions.
 
[Functions]
 
The implementation should preserve the current functional architecture while tightening the highest-risk scroll, theme, settings, auth, and feature integration functions.
 
Existing functions/hooks that are central to this pass:
 
- `useTheme()` in `src/App.jsx`
  - Continue using it as the app-shell theme source.
  - Normalize more UI surfaces around its token output.
 
- `applySettingProfile(profile)` in `src/App.jsx`
  - Keep preset behavior intact while improving settings clarity.
 
- Page/screen scroll reset effect in `src/App.jsx`
  - Preserve container-based scroll resets tied to `mainScrollRef`.
 
- `scrollToTop()` in `src/App.jsx`
  - Keep internal-scroll behavior authoritative and verify it on every in-app section.
 
- Auth actions in `src/App.jsx`
  - `doGoogleSignIn`
  - `doProviderSignIn`
  - `doEmailSignIn`
  - `doForgotPassword`
  - `doRegister`
  - `doSignOut`
  - These must stay visually aligned with the cleaned auth UI and remain error-safe.
 
- Content/navigation helpers in `src/App.jsx`
  - `handleSelect`
  - `goHome`
  - `toggleBk`
  - `saveNote`
  - `shareNote`
  - `exportSettingSnapshot`
  - `resetReadingProgress`
  - These are important integration points between cleanup work and user data state.
 
- Reader functions in `src/components/Reader.jsx`
  - `commitPage`
  - `turn`
  - `copyTopicLink`
  - Keep reading progression and sharing stable during UI polish.
 
- Post-It functions in `src/components/PostItFeed.jsx`
  - `handleVote`
  - `handleAddComment`
  - `handleSubmitPost`
  - Keep interaction correctness while improving UI feedback.
 
- Post-It data helpers in `src/systems/usePostIt.js`
  - `shapePosts`
  - `usePostIt`
  - Preserve optimistic state correctness and realtime synchronization.
 
- Quiz stats helpers in `src/systems/useQuizStats.js`
  - `fromDB`
  - `toDB`
  - `useQuizStats`
  - Keep DB mapping stable during quiz UI cleanup.
 
- User data helpers in `src/systems/useUserData.js`
  - `useDebouncedCallback`
  - `useUserData`
  - Avoid duplicate writes/regressions while app state is reorganized.
 
- Personalization helpers in `src/data/tailoring.js`
  - `buildProfile`
  - `computeEssentialScore`
  - `getPersonalisedRelated`
  - Preserve personalization logic while making settings/profile flows cleaner.
 
- Local continuity helpers
  - `recordReadingDay()` / `getReadingStreak()`
  - `getResumeTopic()` / `setResumeTopic()` / `clearResumeTopic()`
  - These support important home/profile continuity behavior and should be preserved.
 
Candidate helper extractions during implementation if cleanup pressure becomes too high in `src/App.jsx`:
 
- A shared app-shell scroll helper for page changes and scroll-to-top behavior.
- Reusable settings section/card render helpers.
- Shared theme-aware surface/button style builders for common repeated UI blocks.
- Small auth field helpers to avoid repeated inline field wrappers.
 
[Classes]
 
Class-based changes are intentionally minimal because the codebase is overwhelmingly hook- and function-driven.
 
- `ErrorBoundary` in `src/components/ErrorBoundary.jsx` is the only meaningful class component currently present.
- No new class-based architecture is planned for this pass.
- Prefer functional React components/hooks and CSS cleanup over introducing new OO layers.
- `public/home-hero-polish.js` should also avoid growing into a more complex imperative subsystem.
 
[Dependencies]
 
Dependency changes should stay minimal, favoring cleanup and validation over adding new packages.
 
Current runtime dependencies:
 
- `react`
- `react-dom`
- `@supabase/supabase-js`
- `react-router-dom` (currently appears unused and should be audited)
 
Current build/dev dependencies:
 
- `vite`
- `@vitejs/plugin-react`
- `eslint`
- `@eslint/js`
- `eslint-plugin-react-hooks`
- `eslint-plugin-react-refresh`
- `globals`
- `@types/react`
- `@types/react-dom`
 
Dependency strategy for this implementation pass:
 
- Prefer no new dependencies.
- If `react-router-dom` remains unused after implementation, remove it as cleanup.
- Do not add animation/UI libraries for polish that can be handled with existing CSS/React primitives.
- Keep Supabase integration compatible with the current env-variable contract in `.env` / `.env.example`.
 
[Testing]
 
Testing will combine automated validation with focused manual smoke testing of the app's highest-risk user flows.
 
Required automated validation:
 
1. `npm run lint`
2. `npm run build`
 
Required manual smoke testing:
 
- Auth flows
  - Sign in
  - Register
  - Forgot password
  - Password show/hide buttons on desktop and mobile widths
 
- App shell and navigation
  - Navigate between major pages and confirm `.life-main-scroll` resets correctly
  - Verify scroll-to-top visibility and action behavior
  - Confirm topbar, sidebar, dropdowns, and bottom nav remain usable
 
- Dark mode
  - Landing/auth screens
  - Home/dashboard
  - Search dropdown
  - Notification dropdown
  - Sidebar
  - Reader
  - Quiz
  - Post-It
  - Profile and settings
 
- Settings/profile
  - Section labels and grouping
  - Quick presets
  - Restore defaults
  - Snapshot export
  - Reading progress reset
  - Mobile safe-area spacing
 
- Core feature flows
  - Reader notes and sharing
  - Quiz progress/stats
  - Post-It compose/comment/vote
  - Tailoring/onboarding handoff
  - Resume reading and streak continuity
 
- Degraded/offline behavior
  - Missing Supabase env behavior remains non-fatal
  - Empty/error states are readable and non-broken
 
- Public shell
  - Manifest and theme-color presence
  - iOS meta tags remain intact
  - Public polish assets only remain if genuinely needed
 
Recommended final spot-check:
 
- Compare the improved local build against the deployed app for the most visible pain points: shallow scrolling, dark-mode mismatches, settings clutter, auth layout, and mobile touch ergonomics.
 
[Implementation Order]
 
The implementation should proceed from safety-critical cleanup into shell stabilization, then visual normalization, then feature polish, and finally validation.
 
1. Baseline safety and repo cleanup guardrails
   - Work from the current modified tree carefully.
   - Inspect and preserve existing auth, scroll, settings, and dark-mode fixes already landed.
   - Resolve `src/App.css` merge-conflict artifact first so the repo no longer contains obvious broken text.
 
2. App-shell scroll and layout stabilization
   - Finish any remaining `.life-main-scroll` issues.
   - Verify page transitions, scroll-to-top behavior, safe-area padding, dropdown bounds, and mobile reach.
   - Keep this phase isolated before touching broader UI polish.
 
3. Theme-system and dark-mode normalization
   - Continue replacing high-traffic hardcoded light-theme surfaces with theme-aware values/classes.
   - Consolidate shared dark-mode overrides into `src/index.css`.
   - Audit `src/systems/theme.js` side effects and move what should live in CSS.
 
4. Auth and onboarding polish
   - Preserve working password-toggle fixes.
   - Clean remaining auth spacing/touch-target issues.
   - Keep onboarding/tailoring transitions visually consistent with the improved shell.
 
5. Settings and profile information architecture pass
   - Finalize section grouping and labels.
   - Clarify preset actions and utility actions.
   - Remove duplication and improve readability, spacing, and theme consistency.
 
6. Core feature polish pass
   - Reader
   - Quiz
   - Post-It
   - Home/profile continuity cards
   - Focus on visible UX issues, responsive behavior, and empty/error states without destabilizing data logic.
 
7. Technical debt and public-asset cleanup
   - Audit `public/home-hero-polish.js` and related CSS.
   - Delete obsolete password-toggle workaround assets if confirmed dead.
   - Audit `react-router-dom` and remove only if still unused.
 
8. Final validation and release readiness
   - Run lint/build.
   - Perform the manual smoke checks from the testing section.
   - Summarize what changed, including bug fixes, cleanup, and any intentionally deferred items.
