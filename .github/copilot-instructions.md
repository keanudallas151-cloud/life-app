# Copilot Instructions for `life-app`

<<<<<<< HEAD
## Session Baseline

- Treat this repository as `life-app`.
- When local path context matters, use `C:\Users\louie\life-app` as the canonical local repository path.
- Assume `main` is the only working branch unless the user explicitly approves another branch.
- Before continuing any task that depends on current code state, check the latest branch history and confirm the local workspace is up to date with `origin/main`. Always work on the latest update, even if the latest commit was made by someone else. If the workspace is behind, pull `origin/main` first; if history has diverged or there are conflicting local changes, stop and surface it instead of forcing.
- If the current workspace or branch conflicts with those assumptions, say so plainly instead of guessing.
- Be brutally honest, extremely concise, and direct.
- Fix the requested issue first, then opportunistically fix small nearby issues that are clearly in scope and low risk.
- If you uncover a larger issue that materially expands scope, finish the requested work and then surface the larger issue separately with evidence and a recommended follow-up.
- When a reusable lesson is discovered, suggest promoting it into persistent project guidance instead of letting it disappear between chats.

### Companion skills

- `start` — run at the beginning of every conversation; full session bootstrap including latest-update policy.
- `pre-commit-check` — run before committing or pushing; lint/build/repo-rule validation.
- `mobile-audit` — run when touching UI; mobile, iOS, and theme compliance sweep.

## Build, lint, and test commands
=======
These instructions are the fast-start rules for AI coding agents in this repository.
Keep this file concise and link out to source docs instead of duplicating them.
>>>>>>> 544d9cff000ce7b41bd47e26d92e325f2853f745

## Session baseline

- Treat this repository as `life-app`.
- Canonical local path (when path context matters): `C:\Users\louie\life-app`.
- The only long-lived branches allowed are `main` (default) and `main_backup`.
- If any other branch exists, treat it as temporary and plan to merge it into `main` safely, then delete it.
- If current branch is not `main`, surface it plainly and continue only if that branch context is intentional (for example an active PR branch).
- Be direct and concise. Fix requested work first; include only low-risk nearby fixes.

## Branch policy (strict)

- Keep cloud, local, and default workflows aligned on `main`.
- `main_backup` exists only as backup of `main`.
- Do not keep additional long-lived branches.
- For temporary branches, merge to `main` only after safety checks (up-to-date `main`, no conflicts, lint/build pass when code changes are introduced).

## Mandatory freshness check before edits

Before making any change that depends on current code state:

1. Check branch + working tree status.
2. Fetch `origin` and compare with `origin/main`.
3. If behind, pull latest `origin/main` (fast-forward only).
4. If diverged/conflicted, stop and report instead of forcing.

## Source-of-truth docs (link-first)

Use these files instead of re-documenting architecture in responses:

- Project overview, scripts, env vars, Firebase model: [`README.md`](../README.md)
- Internal architecture map / reading path: [`AI_PROMPT_HELPER.md`](../AI_PROMPT_HELPER.md)
- Additional practical notes: [`AI_HELPER.md`](../AI_HELPER.md)
- Release context and decisions: [`docs/releases/`](../docs/releases)

Folder-local guidance:

- Next shell notes: [`app/GEMINI.md`](../app/GEMINI.md)
- Component notes: [`src/components/GEMINI.md`](../src/components/GEMINI.md)
- Systems notes: [`src/systems/GEMINI.md`](../src/systems/GEMINI.md)
- Data notes: [`src/data/GEMINI.md`](../src/data/GEMINI.md)

## Current technical reality (verify before changing)

- Runtime stack: Next.js + React + Firebase (not Supabase runtime).
- Main app controller: `src/App.jsx` (high-risk integration file; edit incrementally).
- App entry: `app/page.jsx` (thin shell that mounts `src/App.jsx`).
- Active shell style constraints and scroll behavior are in `src/index.css`.
- Legacy Vite-era files still exist but Next scripts are authoritative.

## Non-negotiable implementation rules

- Do not rewrite `src/App.jsx` from scratch.
- Keep state-based routing pattern (`screen` / `page`) unless explicitly asked to redesign.
- Do not move primary scrolling to `body`/`html`; preserve app scroll-container behavior.
- Prefer existing theme tokens/patterns over new ad hoc styling.
- Avoid new dependencies unless truly required.

## Validation commands

Run from repo root:

- `npm run lint`
- `npm run build`

There is currently no repository test script in `package.json`.

## Companion skills to load when relevant

- `start` — conversation bootstrap and latest-update policy.
- `mobile-audit` — required when touching UI/layout/mobile/theming.
- `pre-commit-check` — run before commit/push/finalization tasks.

## VS Code debug URL guidance

- Keep local debug targets on `http://localhost:3000` for reliable breakpoints/source maps.
- If needed, use a separate browser launch target for production URLs rather than replacing local debug URL.
