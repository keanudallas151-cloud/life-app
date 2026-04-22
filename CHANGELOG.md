# Changelog

## v0.7.2 — notification system cleanup, support contact wiring, and Firebase sync reliability

- Fixed the Firebase `userData` restore path so cloud data now reads both legacy camelCase and current snake_case field shapes correctly.
- Added a shared notification system with reusable templates, relative timestamps, consistent local persistence, and cross-surface sync events.
- Replaced duplicated notification logic in the app shell, bottom navigation, and Investors & Inventors flow with shared helpers.
- Started using live template-driven notifications for profile updates and networking activity instead of only static shell defaults.
- Surfaced the configured support email in Help and privacy-related contact copy so support guidance is now visible in the running app.

## v0.7.1 — Firebase hardening, safer profiles, and communication templates

- Added versioned Firebase project security/config files for Firestore rules, Storage rules, and indexes.
- Added a shared current-user profile hook so profile loading, saving, and avatar upload logic no longer lives in multiple UI pages.
- Fixed public profile writes so private contact data no longer rides along in readable networking profile documents.
- Fixed the Inventors & Investors media upload path so Firebase Storage rules and runtime uploads now agree.
- Added a source-controlled Firebase communication template pack for auth emails, app-managed emails, and in-app notification copy.
- Added Firebase template documentation and standardized the support contact around `life.customer.support@gmail.com` for upcoming communication flows.

## v0.7.0 — Firebase platform migration and release hardening

- Migrated the remaining runtime profile, avatar, and Inventors & Investors flows off Supabase onto Firebase Auth, Firestore, and Firebase Storage.
- Added shared Firebase profile helpers so account edits, avatar uploads, and auth profile updates stay consistent across the app.
- Improved session restore so app user state hydrates from both Firebase Auth and Firestore profile data, preserving usernames, avatars, and profile metadata after refresh.
- Hardened notifications, networking discovery, and conversation refresh behavior to better match signed-in account state and active message activity.
- Removed the old Supabase runtime client and package dependency from the active app code path.
- Fixed the ESLint 9 flat-config setup so `npm run lint` and `npm run build` both validate cleanly again.
- Cleaned local env handling and release readiness details in support of a safer production workflow.

## v0.6.11 — Security scripts, secret scanning, and untrack guidance

- Stop-tracked local env files and added ignore rules.
- Added repository scripts to locate potential secrets and untrack local envs.
- Added GitHub secret scanning workflow (gitleaks) and a detailed scrub/rotate instructions doc.

## v0.6.10 — Mobile geometry and alignment polish

- Locked key icon controls to square bounds so circular buttons stay circular instead of stretching on mobile.
- Normalized top-bar logo, profile, and search-clear sizing to keep controls evenly aligned on narrow screens.
- Fixed uneven auth action layouts by making secondary/back actions match the primary button stack width.
- Balanced the reset-password modal action row so paired buttons sit evenly instead of sizing by text length.

## v0.6.9 — Auth and backend status hardening

- Added clear setup/status notices across landing, sign-in, register, verify-email, and reset-password screens when Supabase auth is unavailable or needs redirect configuration.
- Blocked auth actions with direct user-facing messages when `NEXT_PUBLIC_SUPABASE_URL` or `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` are missing instead of failing ambiguously.
- Fixed verify-email resend to carry the app redirect URL so local and preview verification flows return to the correct origin.
- Surfaced cloud sync trouble in-app for profile and quiz data instead of leaving those failures only in the console.
- Added a reusable status notice component and matching app banner styling for backend health messaging.

## v0.6.8 — Security, config, and core Supabase hardening

- Removed the tracked local `.env` file from git and expanded ignore rules for local AI/editor noise.
- Standardized the app on canonical `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` env names.
- Removed stale Netlify deployment config and aligned deployment/docs around Vercel.
- Added a core Supabase migration for `user_data`, `quiz_stats`, `posts`, `comments`, and `post_votes` with indexes, defaults, triggers, and RLS.
- Hardened Post-It empty-feed loading and cloud-data migration detection without changing the guest/offline app flow.

## v0.6.7 — Navigation, avatars, settings, and Gemini guide

- Added profile picture upload to the account profile page — tap the avatar circle to choose a photo.
- Profile photo uploads to a dedicated Supabase storage bucket (profile-avatars), separate from Inventors & Investors media.
- Photo is persisted to Supabase auth user_metadata and updates live in app state without a page reload.
- PostIt / Reddit-style feed now shows the poster's real profile photo next to every post and comment. Falls back to initials if no photo is set.
- Added author_avatar_url column to posts and comments tables via migration.
- Reader parchment page now has genuine SVG feTurbulence paper grain texture layered over the existing gradients. Works in both light and dark reading mode. No external image request — baked as a data URI.
- Removed duplicate font-size 16px media query block from index.css (was covered by comprehensive block added in v0.6.6).
- Replaced the old direct Life shortcuts with a `Browse Life` hub that opens grouped navigation cards for onboarding, momentum, goals, and quiz flows.
- Reorganized `Settings` account actions into clearer Profile & Access, Privacy & Legal, and Progress & Reset groups, including surfaced account details and a direct account page jump.
- Added a practical `GEMINI.md` with architecture rules, safe-edit guidance, release context, ready-to-use prompts, and a bug-hunt map for the app.
- Aligned release metadata and planning docs with the current `v0.6.7` version.

## v0.6.6 — Lint fixes, iOS & mobile polish

- Fixed useEffect missing dependency in InventorsInvestors (roleChoice stale closure).
- Fixed crypto not defined error — switched to window.crypto.randomUUID().
- Suppressed three no-img-element warnings with targeted eslint-disable (justified: next.config images.unoptimized=true).
- Polished loading screen Life. dot to use a true circular styled span.
- Improved reading mode tooltip — cleaner caret, better mobile sizing, always dismissible.
- Added comprehensive mobile CSS sweep for top 20 global devices (360–430px).
- Added iOS-specific CSS: momentum scroll, touch-callout, safe area guards, tap highlight removal.
- Added Capacitor-compatible viewport and PWA meta for native iOS packaging path.
- Bumped version from 0.6.5 to 0.6.6.

## v0.6.5 — Inventors & Investors implementation

- Added the full Inventors & Investors flow under the existing networking entry.
- Added 6 in-feature pages: landing, role selection, investor setup, inventor setup, swipe discovery, and messages.
- Added production-oriented Supabase schema, RLS policies, discovery view, storage rules, and messaging RPCs.
- Added mobile-first forms with draft persistence, completeness progress, image previews, validation, and privacy toggles.
- Added swipe discovery with left = interested and right = pass, search, public-contact gating, block/report, and in-app messaging.
- Added unread message counting and conversation read tracking.
- Bumped app version from 0.6.4 to 0.6.5.

## v0.6.2 — Secret Sienna unlock flow

- Added a stricter unlock flow for Secret Sienna.
- Hid the bottom navigation in reading mode.

## v0.6.1 — Networking title correction

- Corrected the main networking page title to Investors & Inventors.

## v0.6.0 — Networking split and account customization

- Split the Discord networking page from the Inventors & Investors surface.
- Added an account customize page.
