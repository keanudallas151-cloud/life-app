# Implementation Task — Life Momentum System + Visual / Stability Pass

Because a dedicated `new_task` tool is not available in this environment, this file is the closest equivalent task handoff for implementation.

Use `implementation_plan.md` as the source of truth for this task.

Refer to @implementation_plan.md for a complete breakdown of the task requirements and steps. You should periodically read this file again.

If you are not already in ACT MODE, switch to ACT MODE before implementing.

## Objective

Implement a balanced finalization pass for the Life. app that delivers:

1. a flagship Momentum System,
2. a broad visual overhaul across the main product surfaces, and
3. a 20-50 item bug-fix and stability sweep,

while preserving the current working tree improvements, the existing guest/local fallbacks, and the current Supabase-backed sync behavior.

## Mandatory References

- Primary plan: `implementation_plan.md`
- Main app shell: `src/App.jsx`
- Main shared styling file: `src/index.css`
- Current user-data sync hook: `src/systems/useUserData.js`
- Current feature surfaces:
  - `src/components/Reader.jsx`
  - `src/components/QuizPage.jsx`
  - `src/components/PostItFeed.jsx`

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

1. Do not restart codebase discovery unless the plan directly conflicts with the real code.
2. Build on the current modified tree; do not overwrite existing improvements blindly.
3. Preserve current guest/localStorage behavior and Supabase-degraded behavior at every step.
4. Prefer helper extraction and CSS consolidation over adding more inline complexity to `src/App.jsx`.
5. Do not add new npm dependencies unless a hard blocker appears.
6. Only remove assets or dependencies after confirming they are truly unused.
7. Treat Momentum as an integrated product layer, not an isolated widget.
8. Finish with `npm run lint` and `npm run build`.

## Required Outcomes

- A new Momentum System exists with daily missions, momentum scoring, and a dedicated hub.
- Home, Profile, and Progress surfaces expose Momentum summary UI.
- Visual consistency is materially improved across auth, home, reader, quiz, post-it, profile, settings, sidebar, search, and notifications.
- At least 20-50 concrete UX, layout, theme, and stability fixes land across the shell and feature flows.
- `src/App.css` no longer contains merge-conflict text.
- Obsolete workaround assets and unused dependencies are removed if confirmed dead.
- Missing-Supabase and offline behavior remain usable and non-fatal.

## Implementation Checklist

- [ ] Phase 1: Baseline cleanup and implementation guardrails
- [ ] Phase 2: Momentum data contract and persistence groundwork
- [ ] Phase 3: Build the pure Momentum engine and hook
- [ ] Phase 4: Integrate Momentum into the app shell and add the flagship page
- [ ] Phase 5: Complete the shared visual overhaul and theme consolidation
- [ ] Phase 6: Execute the focused feature polish and 20-50 bug-fix sweep
- [ ] Phase 7: Remove technical debt, stale assets, and dependency drift where safe
- [ ] Phase 8: Run lint/build and complete the final smoke-test pass

task_progress Items:
- [ ] Step 1: Clean baseline artifacts and verify the current shell before feature work
- [ ] Step 2: Extend persistence and data contracts for Momentum with safe local/cloud fallback
- [ ] Step 3: Build the Momentum engine, hook, and flagship hub UI
- [ ] Step 4: Integrate Momentum with Home, Profile, Progress, Reader, Quiz, and Post-It
- [ ] Step 5: Deliver the visual overhaul and dark-mode/theme normalization
- [ ] Step 6: Complete the broad bug-fix sweep, asset cleanup, and dependency cleanup
- [ ] Step 7: Run lint/build, perform manual smoke tests, and finalize the release summary

## Definition of Done

- `implementation_plan.md` has been followed closely.
- The Momentum System is implemented and visibly integrated into the app.
- The visual overhaul is obvious across the main user-facing surfaces.
- The bug-fix and stability pass resolves the most visible layout, interaction, and theme problems.
- Lint passes.
- Production build passes.
- Final handoff explains what shipped, what was cleaned up, and any intentionally deferred items.