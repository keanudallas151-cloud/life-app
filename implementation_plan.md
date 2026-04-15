# Implementation Plan

[Overview]

Deliver a flagship Momentum System, a broad visual overhaul, and a 20-50 item bug-fix sweep for the existing Life. React/Supabase app without rewriting its core shell.

The current codebase is a React 19 + Vite single-page application with most app flow centralized in `src/App.jsx`, shared styles concentrated in `src/index.css`, feature surfaces implemented in `src/components/`, and optional cloud persistence handled through Supabase via `src/supabaseClient.js`, `src/systems/useUserData.js`, and `src/systems/useQuizStats.js`. The user explicitly asked for all of the following at once: a strong new system, stronger visuals, and a large round of fixes. The implementation therefore needs to extend the existing architecture instead of replacing it.

The recommended centerpiece is a new **Life Momentum System**. This system should convert the app's existing signals—reading activity, saved notes, quiz completions, reading streaks, tailoring profile data, and community participation—into a visible product layer with daily missions, momentum points, levels, streak continuity, and an adaptive “next best action” recommendation. This aligns with the current app because the raw state already exists in `readKeys`, `notes`, `quiz_stats`, `tsd_profile`, `readerPages`, and Post-It activity, but it is not yet unified into a coherent progression experience.

The visual overhaul should preserve the app's editorial, serif-heavy identity while making the product feel more intentional and more modern. The work should consolidate repeated inline styles into reusable CSS, close dark-mode gaps, improve mobile safe-area behavior, strengthen hierarchy across Home, Profile, Settings, Reader, Quiz, and Post-It, and reduce the amount of DOM patching delegated to `public/home-hero-polish.js`. The goal is not a generic redesign; it is a cleaner, richer version of the interface that already exists.

The stability pass should explicitly target at least 30-50 visible improvements. Those improvements should include internal scroll-container issues, overlay bounds, auth field alignment and touch targets, Reader note/share ergonomics, Quiz timer/result readability, Post-It loading/error/empty states, degraded/offline behavior when Supabase is unavailable, stale workaround cleanup, `src/App.css` conflict removal, and dependency drift such as the apparently unused `react-router-dom` package.

This implementation must preserve the current fallback model. Guests and missing-env sessions must continue to work locally through `LS`, authenticated users must continue syncing through the existing `user_data` and `quiz_stats` records, and any new Momentum persistence must degrade safely to local storage if the backend is unavailable or the schema has not yet been updated. This is a product-expansion and hardening pass built on the current working tree, not a rewrite.

Key outcome groups for the pass:

- Momentum system delivery
  - Daily missions tied to reading, note-taking, quizzes, streaks, and community participation.
  - Momentum score, level, streak continuity, and “next action” guidance.
  - Dedicated `momentum_hub` page plus summary cards on Home, Profile, and Progress Dashboard.
- Visual overhaul
  - Shared card/button/input classes across major surfaces.
  - Dark-mode parity across critical screens and overlays.
  - Cleaner spacing, safer mobile layouts, stronger hierarchy, and clearer CTA language.
- Bug-fix sweep
  - Internal scroll correctness and scroll-to-top reliability.
  - Search/notification/sidebar bounds on small screens.
  - Password-toggle stability and auth form cleanup.
  - Reader, Quiz, and Post-It UX fixes.
  - Cleanup of merge artifacts, stale assets, theme side effects, and unused dependencies.

[Types]

Add explicit JavaScript data contracts for the new Momentum layer while extending the existing page, persistence, and feature callback shapes without requiring a TypeScript migration.

- `AppPage`
  - Existing `page` contract in `src/App.jsx` should be extended to include `"momentum_hub"`.
  - Existing values such as `"home"`, `"reading"`, `"quiz"`, `"postit"`, `"profile"`, `"setting_preferences"`, `"progress_dashboard"`, `"categories"`, `"help"`, and `"daily_growth"` must remain valid.
  - Validation rule: every page string used in navigation must map to rendered UI and a document-title mapping.

- `MomentumActionType`
  - Union-like string contract used by the new system.
  - Allowed values: `"read" | "note" | "quiz" | "community" | "streak" | "profile"`.
  - Validation rule: only these normalized types should be stored in Momentum events or missions.

- `MomentumEvent`
  - Event object recorded whenever a mission-relevant user action occurs.
  - Fields:
    - `id: string`
    - `type: MomentumActionType`
    - `source: "reader" | "quiz" | "postit" | "home" | "profile" | "settings"`
    - `createdAt: string` (ISO timestamp)
    - `points: number`
    - `contentKey?: string`
    - `topicKey?: string`
    - `meta?: Record<string, unknown>`
  - Validation rules:
    - `id` must be unique inside the retained event list.
    - `points` must be a non-negative integer.
    - `recentEvents` storage must be capped to avoid unbounded growth.

- `MomentumMission`
  - Daily mission object used by Home and the dedicated hub.
  - Fields:
    - `id: string`
    - `type: MomentumActionType`
    - `label: string`
    - `description: string`
    - `route: AppPage`
    - `ctaLabel: string`
    - `targetCount: number`
    - `progressCount: number`
    - `pointsReward: number`
    - `completed: boolean`
    - `expiresOn: string` (`YYYY-MM-DD`)
    - `contentKey?: string`
    - `topicKey?: string`
  - Validation rules:
    - `targetCount >= 1`
    - `0 <= progressCount <= targetCount`
    - `completed` must derive from `progressCount >= targetCount`
    - Mission ids must be unique per day.

- `MomentumSuggestion`
  - Derived recommendation shown as the current “next best action.”
  - Fields:
    - `actionType: MomentumActionType`
    - `title: string`
    - `body: string`
    - `route: AppPage`
    - `priority: number`
    - `contentKey?: string`
    - `topicKey?: string`
  - Validation rule: only one active suggestion should be surfaced in the top-level UI at a time.

- `MomentumState`
  - Persisted state for the new system.
  - Fields:
    - `version: number`
    - `dateKey: string`
    - `score: number`
    - `level: number`
    - `streakDays: number`
    - `lastActiveAt: string | null`
    - `missions: MomentumMission[]`
    - `completedMissionIds: string[]`
    - `recentEvents: MomentumEvent[]`
    - `nextSuggestion: MomentumSuggestion | null`
  - Validation rules:
    - `score >= 0`
    - `level >= 1`
    - `missions.length` should stay small and deterministic, ideally 3-5 items.
    - `completedMissionIds` must correspond to current or immediately previous mission ids.

- `MomentumSnapshot`
  - Render-ready state derived from persisted Momentum plus live app state.
  - Fields:
    - `score: number`
    - `level: number`
    - `streakDays: number`
    - `completionRate: number`
    - `missions: MomentumMission[]`
    - `nextSuggestion: MomentumSuggestion | null`
    - `highlights: Array<{ label: string; value: string | number; tone?: string }>`
  - Validation rule: this object is derived for UI and should not be the primary persisted payload.

- `UserDataRecord`
  - Existing cloud-backed payload handled by `useUserData(userId)`.
  - Must be extended to include `momentum_state` alongside `bookmarks`, `notes`, `read_keys`, and `tsd_profile`.
  - Validation rule: if `momentum_state` is absent server-side, the app must fall back to a default local value rather than crashing.

- `QuizSessionSummary`
  - Cross-feature callback payload emitted when a quiz completes.
  - Fields:
    - `topic: string`
    - `diff: string`
    - `format: string`
    - `score: number`
    - `total: number`
    - `pct: number`
    - `bestStreak: number`
    - `completedAt: string`
  - Validation rule: this supplements `quiz_stats`; it does not replace it.

- `CommunityActionSummary`
  - Cross-feature callback payload emitted from Post-It actions.
  - Fields:
    - `action: "post_created" | "comment_created" | "vote_cast"`
    - `postId: string | number`
    - `createdAt: string`
    - `flair?: string`
  - Validation rule: only mission-relevant actions should award Momentum points.

- `UiPrefs`
  - Existing preference object seeded by `PREF_DEFAULTS` in `src/App.jsx`.
  - No breaking shape change is required, but any new Momentum visuals and animations must respect `reduceMotion`, `highContrast`, `dataSaver`, and `textScale`.

[Files]

The implementation will add a focused Momentum subsystem and then modify the existing shell, styling, feature, and cleanup files that already control the user experience.

- New files to be created
  - `src/systems/momentumEngine.js`
    - Pure helpers for mission generation, score calculation, daily rollover, and next-action selection.
  - `src/systems/useMomentum.js`
    - Hook that combines persisted Momentum state with current app signals and exposes a stable API to `src/App.jsx`.
  - `src/components/MomentumHub.jsx`
    - Dedicated page for the flagship system, including score, level, streak, missions, recommendation card, and quick actions.
  - `src/components/MomentumCard.jsx`
    - Reusable summary card for Home, Profile, and Progress Dashboard.
  - `src/data/momentumCopy.js`
    - Centralized labels and copy for mission templates, CTA labels, tones, and empty states.
  - `supabase/migrations/*_add_user_data_momentum_state.sql`
    - Migration to add `momentum_state` to `public.user_data` if cloud sync is approved for the feature.

- Existing files to be modified
  - `src/App.jsx`
    - Integrate `useMomentum`, add `momentum_hub`, wire cross-feature callbacks, surface Momentum cards, preserve scroll-container behavior, and continue the auth/settings/profile/home cleanup.
  - `src/index.css`
    - Add shared classes for Momentum surfaces, cards, pills, stat grids, layout helpers, auth/settings/profile polish, dark-mode parity, and shell bug fixes.
  - `src/App.css`
    - Resolve the merge-conflict artifact immediately.
    - Final state should be a clean stub or the file should be removed if unused.
  - `src/systems/useUserData.js`
    - Extend fetch/upsert behavior to include `momentum_state` and add a matching setter.
  - `src/components/Reader.jsx`
    - Improve note/share ergonomics, link-copy feedback, pagination polish, and emit reading/note-related Momentum events.
  - `src/components/QuizPage.jsx`
    - Add an optional completion callback, improve timer/result/stat layout behavior, and preserve current `quiz_stats` behavior.
  - `src/components/PostItFeed.jsx`
    - Improve loading/empty/error states, compose validation, detail-view ergonomics, and emit community events for Momentum.
  - `src/systems/usePostIt.js`
    - Preserve optimistic voting and realtime correctness while exposing clearer success/error semantics.
  - `src/systems/useQuizStats.js`
    - Preserve DB mapping while making quiz completion data easier to use for Momentum integration.
  - `src/components/Tailor.jsx`
    - Keep onboarding-to-personalization flow aligned with Momentum recommendations and entry CTAs.
  - `src/components/Toast.jsx`
    - Confirm toasts still layer correctly above updated mobile UI and Momentum surfaces.
  - `src/components/ErrorBoundary.jsx`
    - Optional styling normalization only if broader theme cleanup makes it inconsistent.
  - `src/systems/theme.js`
    - Reduce document-level side effects and move global styling responsibility into CSS where practical.
  - `src/supabaseClient.js`
    - Preserve current missing-env fallback behavior and ensure new code never assumes a valid backend.
  - `public/home-hero-polish.js`
    - Audit whether it is still needed after Home changes and reduce DOM mutation scope where possible.
  - `public/home-hero-polish.css`
    - Keep only if still necessary after React/CSS-side cleanup.
  - `public/password-toggle-fix.css`
    - Delete if fully obsolete.
  - `public/password-toggle-fix.js`
    - Delete if fully obsolete.
  - `index.html`
    - Verify manifest, theme-color, and public asset references remain correct.
  - `package.json`
    - Remove `react-router-dom` if final audit confirms it is still unused.
  - `package-lock.json`
    - Keep lockfile aligned if dependencies are removed.
  - `README.md`
    - Update setup and feature notes if Momentum or Supabase schema expectations change.
  - `AI_PROMPT_HELPER.md`
    - Optional update if the Momentum subsystem materially changes the recommended reading path.

- Files to be deleted or moved
  - `public/password-toggle-fix.css`
    - Delete after confirming there are no remaining references.
  - `public/password-toggle-fix.js`
    - Delete after confirming there are no remaining references.
  - `src/App.css`
    - Delete if unimported and no longer needed after cleanup.
  - No directory moves are planned.

- Configuration file updates
  - No new environment variables are required.
  - If the Supabase migration is applied, the `public.user_data` schema and policies must be updated in lockstep with the frontend.

[Functions]

The implementation adds a new Momentum engine/hook layer and modifies the current shell and feature functions that already own navigation, persistence, and interaction behavior.

- New functions
  - `createDefaultMomentumState(dateKey)`
    - File: `src/systems/momentumEngine.js`
    - Purpose: create a safe default Momentum state for guests, new users, and missing-schema fallbacks.
  - `rolloverMomentumState(state, dateKey)`
    - File: `src/systems/momentumEngine.js`
    - Purpose: regenerate daily missions when the stored day changes while preserving long-lived score/streak fields.
  - `buildDailyMissions({ profile, readKeys, notes, quizStats, momentumState })`
    - File: `src/systems/momentumEngine.js`
    - Purpose: create 3-5 daily missions driven by personalization and current progress.
  - `deriveMomentumSnapshot({ momentumState, readKeys, notes, quizStats, profile })`
    - File: `src/systems/momentumEngine.js`
    - Purpose: compute render-ready metrics, highlights, completion percentages, and recommendation data.
  - `recordMomentumEvent(state, event)`
    - File: `src/systems/momentumEngine.js`
    - Purpose: append a normalized event, update mission progress, and award points.
  - `getNextMomentumSuggestion(snapshot)`
    - File: `src/systems/momentumEngine.js`
    - Purpose: choose the highest-priority recommendation shown on Home and in the hub.
  - `useMomentum({ userId, persistedState, readKeys, notes, quizStats, profile, isGuest, persist })`
    - File: `src/systems/useMomentum.js`
    - Purpose: own Momentum lifecycle, expose a stable API, and coordinate local/cloud persistence.
  - `MomentumHub(props)`
    - File: `src/components/MomentumHub.jsx`
    - Purpose: render the flagship page UI.
  - `MomentumCard(props)`
    - File: `src/components/MomentumCard.jsx`
    - Purpose: render compact summary UI for Home, Profile, and Progress Dashboard.

- Modified functions
  - `useUserData(userId)`
    - File: `src/systems/useUserData.js`
    - Required changes: extend select/upsert payloads with `momentum_state`, add `momentumState` and `setMomentumState`, and preserve guest reset behavior.
  - `setPage(p)`
    - File: `src/App.jsx`
    - Required changes: support `momentum_hub` and keep scroll/overlay cleanup behavior correct.
  - `handleSelect(key, node)`
    - File: `src/App.jsx`
    - Required changes: keep Reader navigation behavior, preserve streak/resume tracking, and emit a read-related Momentum event without double-counting.
  - `saveNote()`
    - File: `src/App.jsx`
    - Required changes: preserve note persistence, emit a note Momentum event, and improve saved-state feedback.
  - `shareNote()`
    - File: `src/App.jsx`
    - Required changes: preserve the Post-It draft flow, emit a share/community Momentum event, and avoid stale timers or duplicated feedback.
  - `goHome()`
    - File: `src/App.jsx`
    - Required changes: keep current navigation semantics while surfacing Momentum suggestion state cleanly.
  - `scrollToTop()`
    - File: `src/App.jsx`
    - Required changes: remain authoritative on `.life-main-scroll` and keep fallback behavior safe.
  - `applySettingProfile(profile)`
    - File: `src/App.jsx`
    - Required changes: preserve `focus`, `immersive`, and `calm` while clarifying their presentation.
  - `copyNotes()` and `shareVia(method)`
    - File: `src/components/Reader.jsx`
    - Required changes: harden clipboard/share fallbacks, improve inline feedback, and prevent empty-note actions from feeling broken.
  - `commitPage(n)` and `turn(dir)`
    - File: `src/components/Reader.jsx`
    - Required changes: preserve reader page persistence while improving animation/pagination feel and avoiding shallow-scroll regressions.
  - `copyTopicLink()`
    - File: `src/components/Reader.jsx`
    - Required changes: unify feedback styling with the rest of the app and preserve current hash-link behavior.
  - `startQuiz()`
    - File: `src/components/QuizPage.jsx`
    - Required changes: preserve question selection logic while exposing a clean completion summary to the app shell.
  - `handleAnswer(picked)`
    - File: `src/components/QuizPage.jsx`
    - Required changes: preserve scoring/timer correctness while improving transitions and timeout handling.
  - Result persistence effect (`useEffect` when `phase === "result"`)
    - File: `src/components/QuizPage.jsx`
    - Required changes: keep `quiz_stats` mapping stable, produce a `QuizSessionSummary`, and improve recap clarity.
  - `handleVote(id, dir)`, `handleAddComment()`, and `handleSubmitPost()`
    - File: `src/components/PostItFeed.jsx`
    - Required changes: preserve optimistic behavior, improve invalid-action feedback, and emit community events for Momentum.
  - `load()`, `addPost()`, `addComment()`, and `vote()`
    - File: `src/systems/usePostIt.js`
    - Required changes: keep realtime correctness and improve recoverability, empty/error handling, and callback integration.
  - `saveStats(next)`
    - File: `src/systems/useQuizStats.js`
    - Required changes: preserve current DB upsert behavior and make downstream integration safe.

- Removed functions
  - No named business-logic removals are planned inside `src/`.
  - Expected removals are limited to dead workaround/public polish code if those files are confirmed unused.

[Classes]

Class-based changes should remain minimal because the app is overwhelmingly function- and hook-driven.

- New classes
  - None planned.

- Modified classes
  - `ErrorBoundary`
    - File: `src/components/ErrorBoundary.jsx`
    - Specific modifications: optional styling/token alignment only if broader shell cleanup makes it visually inconsistent.

- Removed classes
  - None planned.

- Replacement strategy
  - Keep all new work in functional components, pure helpers, hooks, and CSS.
  - Do not introduce new class-based UI or state layers for Momentum or theme cleanup.

[Dependencies]

Dependency changes should stay minimal, with the implementation relying on the existing React/Vite/Supabase stack rather than adding new UI or state libraries.

- Runtime dependencies
  - Keep `react`, `react-dom`, and `@supabase/supabase-js` unchanged unless a concrete bug demands an update.
  - Remove `react-router-dom` from `package.json` and `package-lock.json` if the final audit still confirms it is unused.

- Dev dependencies
  - Keep the existing ESLint/Vite toolchain unchanged.
  - Do not add animation, design-system, routing, or global-state libraries for work that can be handled with existing React and CSS primitives.

- Supabase integration requirements
  - If cloud sync for Momentum is approved, add `momentum_state jsonb` to `public.user_data`.
  - Keep RLS aligned with the current `user_data` access model.
  - Ensure the authenticated user can select and upsert the row without breaking existing fields.
  - If the schema is absent, the feature must fall back to local-only storage rather than fail.

- Environment/configuration requirements
  - No new `VITE_*` variables are required.
  - `README.md` should document the optional schema extension if it is added.

[Testing]

Validation should combine lint/build automation with a targeted manual smoke-test matrix that covers the new Momentum layer, the visual overhaul, and the large bug-fix surface.

- Automated validation
  - `npm run lint`
  - `npm run build`

- Manual validation: Momentum system
  - Open Home and confirm the Momentum summary card renders for guest and signed-in users.
  - Open `momentum_hub` and verify missions, score, level, streak, and next-action recommendation render correctly.
  - Complete a reading action, a saved note, a quiz run, and a Post-It action; verify mission progress updates.
  - Confirm daily rollover regenerates missions safely.
  - Confirm the system still behaves when Supabase env vars are missing.

- Manual validation: shell and visual overhaul
  - Landing page
  - Sign-in page
  - Register page
  - Home page
  - Momentum hub
  - Progress Dashboard
  - Profile
  - Settings
  - Reader
  - Quiz
  - Post-It
  - Search dropdown
  - Notification dropdown
  - Sidebar
  - Scroll-to-top button
  - Bottom nav and safe-area behavior on mobile-sized viewports

- Manual validation: Reader
  - Open a topic from Home and from hash-link navigation.
  - Save a note, copy notes, share notes, and copy the topic link.
  - Verify page turns, page dots, saved page restore, related topics, and saved-topic lists.
  - Confirm notes/share UI behaves correctly in dark mode and on smaller screens.

- Manual validation: Quiz
  - Start quizzes in normal, true/false, blitz, and daily modes.
  - Let the timer expire naturally.
  - Verify result calculations, recent history, achievements, and stat cards.
  - Confirm grids and result actions remain readable on narrow screens.

- Manual validation: Post-It
  - Confirm loading, empty, and backend-error states are readable.
  - Share a note into Post-It via `shareNote()` and verify draft prefill.
  - Create a post, add a comment, and vote up/down.
  - Confirm optimistic updates remain correct and realtime echoes do not double-count.

- Manual validation: degraded/offline behavior
  - Run with missing Supabase env vars and confirm the shell stays usable.
  - Toggle offline mode and confirm errors are understandable and non-fatal.
  - Verify Momentum falls back locally if cloud persistence is unavailable.

- Manual validation: schema integration (if migration is applied)
  - Confirm `user_data` fetches `momentum_state` for the authenticated user.
  - Confirm updates/upserts to `momentum_state` do not break `bookmarks`, `notes`, `read_keys`, or `tsd_profile`.
  - Confirm the UI remains safe if the column is absent in a partially migrated environment.

[Implementation Order]

The work should proceed from low-risk cleanup and persistence groundwork into the new Momentum system, then visual consolidation, then the broad bug-fix sweep, and finally validation.

1. Baseline cleanup and implementation guardrails
   - Treat the current working tree as the baseline.
   - Resolve `src/App.css` merge-conflict markers immediately.
   - Reconfirm unused asset/dependency candidates (`public/password-toggle-fix.*`, `react-router-dom`, `public/home-hero-polish.js` scope).

2. Momentum data-contract and persistence groundwork
   - Define the Momentum contracts in code-facing terms.
   - Extend `src/systems/useUserData.js` for `momentum_state`.
   - Add local fallback behavior first, then layer in the optional Supabase migration path.

3. Build the pure Momentum engine and hook
   - Create `src/systems/momentumEngine.js`.
   - Create `src/systems/useMomentum.js`.
   - Build on existing app primitives rather than introducing disconnected state.

4. App-shell integration and flagship page delivery
   - Add `momentum_hub` into `src/App.jsx` page handling and document titles.
   - Surface Momentum summary cards on Home, Profile, and Progress Dashboard.
   - Wire Reader, Quiz, and Post-It actions into Momentum events without breaking current flows.

5. Shared visual overhaul and theme consolidation
   - Move repeated inline surface/button/input styling into `src/index.css`.
   - Close dark-mode gaps across Home, Auth, Momentum, Reader, Quiz, Post-It, Profile, Settings, Sidebar, Search, and Notifications.
   - Reduce global imperative styling in `src/systems/theme.js`.

6. Focused feature polish and 20-50 bug-fix sweep
   - Reader: note/save/share/link/page UX.
   - Quiz: timer, stats, result, mobile layout, achievement clarity.
   - Post-It: loading/error/empty states, compose, comment, optimistic interaction feedback.
   - Auth/Settings/Profile: hierarchy, spacing, toggles, presets, touch targets, and visual consistency.
   - Shell: scroll container, overlay bounds, safe areas, scroll-to-top, mobile traps.

7. Technical-debt cleanup
   - Reduce or remove `public/home-hero-polish.js` responsibility where feasible.
   - Delete obsolete password-toggle workaround assets if confirmed dead.
   - Remove `react-router-dom` if the final codebase still does not use it.
   - Update README/help docs if product behavior or schema expectations changed.

8. Final validation and handoff
   - Run lint and production build.
   - Complete the manual smoke-test matrix.
   - Record any deferred items explicitly, but do not leave obvious regressions unresolved.