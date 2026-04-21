# Implementation Task — Life. Finalization Pass
 
Use `implementation_plan.md` as the source of truth for this task.
 
Refer to @implementation_plan.md for a complete breakdown of the task requirements and steps. You should periodically read this file again.
 
## Objective
 
Implement the finalization pass for the Life. app by following the phases and constraints in `implementation_plan.md`. Build on the current working tree, preserve the fixes already landed, and push the app toward a cleaner, more stable, more polished production state.

## Current Status Update

### Completed in this pass

- [x] Fixed the app-opening/runtime blocker by updating Supabase env handling for the active Next.js runtime while preserving legacy Vite-compatible variable names.
- [x] Fixed the Vercel deployment blocker by removing the stale `dist` output setting from `vercel.json`.
- [x] Added a real `next.config.mjs` so Next/Vercel use the intended project config.
- [x] Implemented the auth flow updates in `src/App.jsx` for email confirmation gating, `verify_email`, password recovery/reset handling, sign-out cleanup, session event handling, and guest-screen protection.
- [x] Improved dark mode so the app no longer forces a light document background and reduced obvious light/white patches across key auth and shell surfaces.
- [x] Softened the dark palette so dark mode remains dark without looking as harsh as before.
- [x] Preserved and improved mobile-first auth/app shell sizing work already in progress, including safe-area-aware surfaces and smaller-screen spacing fixes.
- [x] Removed stale Next/Vercel migration leftovers that were still creating warnings or confusion (`next_config.js`, empty password-toggle workaround assets, and manual stylesheet tags in the Next root layout).
- [x] Cleaned the remaining Next lint warnings by switching the lone social-login icon to `next/image` and moving the hero polish stylesheet into the layout import path.

### Remaining active implementation task

- [ ] Manually verify the Supabase dashboard-only auth settings that are not exposed by the currently available MCP tools: Email provider confirm-email toggle, Google provider setup, Site URL / Redirect URLs, confirmation email template content, and email rate limits.
 
## Mandatory References
 
- Primary plan: `implementation_plan.md`
- Main app shell: `src/App.jsx`
- Main shared styling file: `src/index.css`
 
## Plan Document Navigation Commands
 
```bash
# Read Overview section
sed -n '/\[Overview\]/,/\[Types\]/p' implementation_plan.md | cat
 
# Read Types section
sed -n '/\[Types\]/,/\[Files\]/p' implementation_plan.md | cat
 
# Read Files section
sed -n '/\[Files\]/,/\[Functions\]/p' implementation_plan.md | cat
 
# Read Functions section
sed -n '/\[Functions\]/,/\[Classes\]/p' implementation_plan.md | cat
 
# Read Classes section
sed -n '/\[Classes\]/,/\[Dependencies\]/p' implementation_plan.md | cat
 
# Read Dependencies section
sed -n '/\[Dependencies\]/,/\[Testing\]/p' implementation_plan.md | cat
 
# Read Testing section
sed -n '/\[Testing\]/,/\[Implementation Order\]/p' implementation_plan.md | cat
 
# Read Implementation Order section
sed -n '/\[Implementation Order\]/,$p' implementation_plan.md | cat
```
 
## Execution Rules
 
1. Follow the phase order in `[Implementation Order]` unless a later step is blocking an earlier one.
2. Do not overwrite unrelated existing work in the repo.
3. Preserve the current password-toggle fixes, internal scroll-container fixes, and settings/dark-mode progress unless replacing them with a clearly better version.
4. Prefer small helper extraction and CSS consolidation over adding more inline complexity to `src/App.jsx`.
5. Do not add new dependencies unless absolutely necessary.
6. Only remove assets or dependencies after confirming they are truly unused.
7. Finish with `npm run lint` and `npm run build`.
 
## Target Outcomes
 
- Scroll depth and scroll-to-top behavior are fully correct across the in-app shell.
- Dark mode is consistent across the critical user-facing surfaces.
- Settings and profile are clearly labeled, grouped, and easier to use.
- Auth screens are clean on desktop and mobile, including password toggle controls.
- Reader, Quiz, and Post-It receive visible UX polish and stronger empty/error/loading states.
- Technical debt artifacts are reduced, including stale workaround files and merge-conflict leftovers.
- The implementation lands at least 30 concrete fixes/polish upgrades across UX, layout, theme, and cleanup.
 
## Implementation Checklist
 
- [x] Phase 1: Baseline safety and repo cleanup guardrails
- [x] Phase 2: App-shell scroll and layout stabilization
- [x] Phase 3: Theme-system and dark-mode normalization
- [x] Phase 4: Auth and onboarding polish
- [x] Phase 5: Settings and profile information architecture pass
- [x] Phase 6: Core feature polish pass
- [x] Phase 7: Technical debt and public-asset cleanup
- [ ] Phase 8: Final validation and release readiness
 
task_progress Items:
- [x] Step 1: Preserve and verify the current modified baseline before further implementation
- [x] Step 2: Complete app-shell scroll and layout stabilization
- [x] Step 3: Normalize theme behavior and close major dark-mode gaps
- [x] Step 4: Finalize auth, onboarding, settings, and profile polish
- [x] Step 5: Polish Reader, Quiz, Post-It, and continuity features
- [x] Step 6: Remove technical debt, obsolete assets, and dependency drift where safe
- [ ] Step 7: Run lint/build and complete the final smoke-test pass
 
## Definition of Done
 
- `implementation_plan.md` has been followed closely.
- The Momentum System is implemented and visibly integrated into the app.
- The visual overhaul is obvious across the main user-facing surfaces.
- The bug-fix and stability pass resolves the most visible layout, interaction, and theme problems.
- Lint passes.
- Production build passes.
- Final handoff explains what shipped, what was cleaned up, and any intentionally deferred items.