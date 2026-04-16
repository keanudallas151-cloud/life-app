# Changelog

All notable prototype milestones for Life are tracked here.

## v0.4.6 - Dependency updates

- bumped Next.js from 15.5.15 to 16.2.4
- bumped TypeScript from 5.9.3 to 6.0.2
- bumped @types/node from 20.19.39 to 25.6.0
- bumped eslint-config-next from 15.5.15 to 16.2.4
- bumped @supabase/supabase-js from 2.103.0 to 2.103.3
- bumped actions/checkout from 4 to 6 and actions/setup-node from 4 to 6

## v0.4.5 - Component extraction and matching MVP

- extracted App.jsx from 8676 → 6777 lines by pulling out 5 page components
- new HomePage component with "Continue Reading" resume card using localStorage topic tracking
- new SidebarSectionPage component consolidating 5 sidebar explanation pages into one data-driven file
- new ConnectPage component: investor/inventor matching MVP with pitch cards, role selection, industry filters, and create-pitch form
- new ProfilePage component extracted from the profile page block
- new SettingsPage component with theme choice, motion, sound, and account reset controls
- removed 966 lines of dead Settings Hub code (showProfileSettingsHub was always false)
- removed orphaned exportSettingSnapshot and resetReadingProgress functions

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
