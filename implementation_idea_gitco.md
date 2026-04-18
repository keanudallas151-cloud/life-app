# Life. — Actionable Todo List

**Current baseline:** `v0.6.2`  
**Purpose:** Replace old idea dumping with one clear, prioritized working backlog.

---

## How to use this file

- Work **top to bottom**.
- Treat **Now** as the real active backlog.
- Treat **Next** as the follow-up queue once the current sweep is stable.
- Treat **Later** as worthwhile, but not urgent.
- Do **not** use this file for vague product dreaming; only add tasks that are concrete and traceable to a screen, file, or product goal.

---

## 1. NOW — High-value tasks

### 1. Release hygiene and repo truth
- [ ] Keep `package.json`, `package-lock.json`, `CHANGELOG.md`, and `VERSIONING.md` aligned every time the app version changes.
- [ ] Decide whether `main_backup` should be brought up to date with `main` after each release batch.
- [ ] Remove or refresh stale handoff/planning docs that still describe old versions or already-finished work.

**Why this matters:** The repo has had multiple version/history mismatches already, and stale docs make future sweeps noisy.  
**Files:** `package.json`, `package-lock.json`, `CHANGELOG.md`, `VERSIONING.md`, `HANDOFF.md`, `REMAINING_TASKS.md`

### 2. Full mobile QA pass on the shipped app
- [ ] Manually test the main shell on narrow mobile widths: `320px`, `360px`, `393px`, `430px`.
- [ ] Verify top bar, sidebar, search, notification panel, reader, bottom nav, and auth screens all respect safe areas.
- [ ] Verify no double scrolling, clipped overlays, or unreachable controls.
- [ ] Verify minimum 44px tap targets on key controls.

**Why this matters:** This app is mobile-first, and most real regressions show up at narrow widths or on iOS-like safe-area layouts.  
**Core files:** `src/App.jsx`, `src/index.css`, `src/components/BottomNav.jsx`, auth page components

### 3. Dark mode consistency sweep
- [ ] Replace remaining harsh hardcoded text/background colors in JSX where theme tokens should be used.
- [ ] Verify all major pages still look intentional in dark mode, not merely readable.
- [ ] Audit overlays, cards, badges, notification UI, and special pages for contrast consistency.

**Why this matters:** Theme drift is one of the easiest ways for the app to feel unfinished.  
**Core files:** `src/App.jsx`, `src/components/*.jsx`, `src/systems/theme.js`

### 4. Reader quality pass
- [ ] Verify the current reading mode behavior end-to-end: toolbar hiding, bottom-nav hiding, progress visibility, page turns, and scroll reset.
- [ ] Improve the reading surface so long-form content feels calm and book-like.
- [ ] Check that supporting visuals, charts, and audio blocks appear where they help, not only as afterthoughts.

**Why this matters:** Reader quality is central to the product, and it is one of the most high-impact surfaces in the app.  
**Core files:** `src/components/Reader.jsx`, `src/data/content.js`, `src/index.css`

### 5. App shell cleanup without rewriting the app
- [ ] Continue extracting self-contained page blocks from `src/App.jsx` into dedicated components.
- [ ] Centralize page metadata like titles and route-like page labels so they do not drift.
- [ ] Remove dead page states, one-off wiring, or stale state that no longer drives visible UI.

**Why this matters:** `src/App.jsx` is still the highest-risk integration file. Small extractions now reduce breakage later.  
**Core files:** `src/App.jsx`, `src/components/AppShell.jsx`

---

## 2. NEXT — Product improvements that now make sense

### 6. Content structure upgrade
- [ ] Rewrite weak or list-like topics into smoother, more book-style prose.
- [ ] Add clear title-page behavior for topics that need a stronger chapter opening.
- [ ] Support inline content markers for charts, callouts, and diagrams inside reading flow.

**Why this matters:** The content experience still matters more than adding more features.  
**Core files:** `src/data/content.js`, `src/components/Reader.jsx`

### 7. Home and dashboard become stronger command centers
- [ ] Improve the “what should I do next?” guidance on Home and Progress Dashboard.
- [ ] Make recent activity, momentum, and unfinished actions easier to resume.
- [ ] Tighten card hierarchy so the most valuable next action is visually obvious.

**Why this matters:** The app should pull users back into action, not just show static information.  
**Core files:** `src/components/HomePage.jsx`, `src/components/ProgressDashboardPage.jsx`, momentum-related hooks

### 8. Communication practice surface
- [ ] Decide whether communication practice should remain inside Quiz or become its own dedicated page.
- [ ] If audio assets exist, wire them into a cleaner guided practice UI.
- [ ] Add a real warmup / speaking / reflection flow if this area is meant to be a real feature.

**Why this matters:** The data structure exists, but the experience still feels partial.  
**Core files:** `src/data/quiz.js`, `src/components/QuizPage.jsx`

### 9. Badges and reward system
- [ ] Redesign milestone and badge presentation so it feels earned, organized, and motivating.
- [ ] Add meaningful progression tiers instead of flat achievement lists.
- [ ] Tie rewards more clearly to reading, quiz completion, streaks, and personal goals.

**Why this matters:** Motivation systems only help if they feel structured and premium.  
**Likely files:** `src/components/ProgressDashboardPage.jsx` and related reward UI

### 10. Profile and community polish
- [ ] Make Profile feel more intentional as a personal hub, not just a stats dump.
- [ ] Improve Post-It interaction quality and content hierarchy.
- [ ] Keep notifications useful, readable, and tied to real actions.

**Why this matters:** Social and identity surfaces should feel alive, not secondary.  
**Core files:** `src/components/ProfilePage.jsx`, `src/components/PostItFeed.jsx`, `src/App.jsx`

---

## 3. LATER — Worth doing, not urgent

### 11. Focused test coverage
- [ ] Add tests only after more logic is extracted out of `src/App.jsx`.
- [ ] Start with small, stable targets: pure helpers, hooks, or isolated page logic.
- [ ] Avoid adding a large test surface before the current app structure is easier to maintain.

**Decision:** Worth doing later, **not** worth forcing right now.

### 12. Better runtime monitoring
- [ ] Add client-side error monitoring if production debugging becomes painful.
- [ ] Only do this once the product surface is stable enough that alert noise will be useful.

**Decision:** Worth doing later, **not** a current blocker.

### 13. Performance pass
- [ ] Audit the heaviest surfaces on lower-end mobile devices.
- [ ] Check long pages, overlays, gradients, and transitions for jank.
- [ ] Optimize only where real slowdown is observed.

**Decision:** Worth doing after the main UI/content backlog is calmer.

### 14. TypeScript migration
- [ ] Keep this incremental if it ever starts.
- [ ] Migrate leaf components and utilities first.
- [ ] Do not turn this into a repo-wide rewrite project.

**Decision:** Useful eventually, but not a smart priority right now.

---

## 4. NOT A PRIORITY RIGHT NOW

- [ ] Do **not** add tooling just because a checklist suggests it.
- [ ] Do **not** rewrite `src/App.jsx` from scratch.
- [ ] Do **not** add React Router.
- [ ] Do **not** treat “more features” as automatically better than fixing flow, consistency, and content quality.

**Examples of things to avoid rushing:**
- Adding Vitest before the code is easier to test
- Adding Sentry before real production monitoring pain exists
- Large architectural rewrites with no immediate product payoff

---

## 5. Suggested execution order

1. Release hygiene and stale-doc cleanup  
2. Full mobile QA pass  
3. Dark mode consistency sweep  
4. Reader quality pass  
5. Incremental `App.jsx` extraction  
6. Content structure upgrade  
7. Home / dashboard improvement  
8. Communication practice decision  
9. Badges redesign  
10. Tests / monitoring / performance only after the above

---

## 6. Definition of done for future sessions

A task should usually be considered done only when:

- The code path is actually wired into the app
- The relevant page works on mobile widths
- Dark mode still looks right
- `npm run lint` passes
- `npm run build` passes
- Version/docs are updated if the release changed

