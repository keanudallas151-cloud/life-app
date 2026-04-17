# Changelog

All notable prototype milestones for Life are tracked here.

## v0.5.0 — Full polish sweep, workflow upgrades, and cleanup

- removed AI-style decorative banner comments from `src/` and cleaned leftover section markers
- removed unused imports across the app shell, auth screens, profile, settings, and navigation components
- upgraded Home with quick action launch cards for quiz, Daily Growth, and Momentum Hub
- upgraded Progress Dashboard with a dynamic "Next Best Step" card plus one-tap shortcuts
- upgraded Daily Growth with streak tracking, weekly rhythm history, smarter "Next Up" guidance, and momentum event syncing
- upgraded Profile with quick action shortcuts for dashboard, Daily Growth, and settings
- fixed notification dropdown sizing on narrow screens so it stays inside the viewport
- improved home hero theming so the gradient respects the active theme
- improved reader share handling and audio player accessibility labels
- lint and production build pass clean

## v0.4.9 — Consolidated UI fixes, dark mode polish, ESLint cleanup

- fixed sidebar gaps on mobile — removed inline width/maxWidth/padding, CSS now controls all sizing with flex-column layout
- fixed notification badge off-center — switched to `display: grid; placeItems: center`
- fixed gear icon oval on profile page — wrapped in flexShrink:0 container
- fixed swipe-to-delete vs vertical scroll conflict — added direction locking with horizontal bias threshold
- fixed dark mode text: LandingPage Sign In button was invisible (white-on-white), toast now uses theme token
- fixed QuizPage `StatCard` and `AchievementBadge` sub-components to accept `t` theme prop for proper dark mode support
- added Android back button support for Daily Growth modal via popstate history management
- added Goals entry to sidebar under Life section
- sidebar Sign Out button now reliably pins to bottom (flex-column in base CSS rule)
- deleted two accidental junk files from repo root (`{console.error(error)` and `{const`)
- verified: password toggle has no inline positioning, page-turn MP3s exist, hamburger alignment correct
- CI lint and build pass clean

## v0.4.8 - Theme picker, category hub pages, clickable sidebar

- added ThemePickerPage — dark/light/system mode selection shown after sign-in before tailoring
- added CategoryHubPage — browsable hub page for any LIBRARY category (Finance, Psychology, etc.)
- made sidebar folder nodes clickable — tapping Finance, Psychology, Online, AI & Technology, or 100 Ways to Make Money opens a dedicated category page with grouped topics, read badges, and one-tap navigation to any topic
- TreeNode component now supports onFolderSelect prop for folder-click navigation
- auth flow updated: new users → theme picker → tailoring → app
- auth error messages already implemented in v0.4.7 (email already used / not registered)

## v0.4.7 - Massive component extraction

- reduced App.jsx from 6,777 → 3,180 lines (53% reduction)
- extracted 11 new component files from inline JSX:
  - WhereToStartPage — recommended reading order page
  - HelpPage — FAQ page
  - CategoriesPage — category stepper with completion certificate
  - ProgressDashboardPage — momentum card, stats grid, challenges
  - LeaderboardPage — ranking display
  - DailyGrowthPage — daily growth tips
  - MentorshipPage — mentorship booking
  - PremiumPage — premium pricing cards
  - VerifyEmailPage — email verification screen
  - ResetPasswordPage — password reset with strength meter
  - BottomNav — mobile bottom navigation bar
- extracted 3 large auth screen components (LandingPage, SignInPage, RegisterPage) via background agents
- moved password strength computation into ResetPasswordPage and RegisterPage (self-contained)
- moved CATEGORIES constant into CategoriesPage (re-exported for shared use)
- removed ~3,600 lines of inline JSX from App.jsx
- all lint errors resolved, build passes clean

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
