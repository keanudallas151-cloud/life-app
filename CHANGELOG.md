# Changelog

All notable prototype milestones for Life are tracked here.

## v0.4.1 - Next, Supabase, and workflow alignment

- moved the app onto an env-driven Next.js and Vercel-friendly Supabase setup
- centralized auth redirect handling for local, production, and preview deployments
- replaced unsafe placeholder GitHub workflows with real CI and Dependabot automation
- removed obsolete implementation/planning markdown files and replaced them with `implementation_idea_gitco.md`
- aligned release rules around the `v0.4.x` format and the `main` / `main_backup` branch model

## v0.4.0 - Build recovery baseline

- restored a working production build on `main`
- removed duplicate `ErrorBoundary` declarations and duplicate app rendering
- removed broken `lucide-react` and `framer-motion` dependencies from error and toast UI paths
- aligned the repo so `main` points to the working recovery commit

## v0.0.3 - Merged prototype baseline

- merged the reading streak branch into the prototype line
- kept the app moving as a single baseline before the recovery fixes

## v0.0.2 - Early prototype snapshot

- second prototype milestone
- working app iteration before later branch drift

## v0.0.1 - Initial prototype

- first repository upload
- initial Vite + React prototype baseline
