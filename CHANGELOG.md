# Changelog

All notable prototype milestones for Life are tracked here.

## v0.4.4 - Backend fix and product identity

- created the `user_data` table in Supabase with RLS policies so signed-in users can sync bookmarks, notes, highlights, and momentum state
- updated all production metadata (title, description, OG, Twitter, PWA manifest) from "free educational platform" to match the real product vision: build wealth, learn anything, connect with investors and creators
- expanded implementation_idea_gitco.md with categorized audit findings: investor matching, monetization, community, mobile polish, and backend hardening
- added Supabase MCP server config for future direct database management

## v0.4.3 - Profile cleanup and workspace optimization

- removed Settings Hub from the profile page; settings are now only accessible via the gear icon
- cleaned up dead `applySettingProfile` code that was only used inside the removed hub
- optimized VS Code workspace settings for ESLint, GitLens, Copilot, and editor defaults
- added `dev:turbo` script for optional Turbopack development builds

## v0.4.2 - Reader, shell, and preference polish

- added saved reader quotes/highlights across Reader, Saved, momentum summaries, and progress surfaces
- simplified the homepage into a focused landing experience and added sidebar category explanation pages
- cleaned up sidebar hierarchy by keeping section labels informational, moving Daily Growth under Life, and keeping the shell visually more consistent in dark mode
- upgraded theme selection from a simple toggle to a real user preference with system, light, and dark modes
- fixed the main app shell scroll behavior so desktop and mobile scrolling work through the content area again

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
