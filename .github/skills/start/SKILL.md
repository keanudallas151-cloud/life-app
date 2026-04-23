---
name: start
description: 'Bootstrap every life-app conversation. Use at the start of any life-app task to anchor repo, branch, latest-update policy, and concise proactive working style. Triggers: start, begin, new conversation, re-orient, session baseline, life-app context.'
argument-hint: 'What life-app task should be handled?'
---

# Start

Runs at the start of every life-app conversation. Locks the agent into the correct repo, branch, latest update, and behavior posture before it touches anything.

## Use When

- Starting any new conversation about `life-app`
- Re-orienting after context loss mid-conversation
- Confirming branch, repo, latest-update, and behavior expectations
- The user expects concise, direct, proactive problem solving

## Baseline Assumptions

- Repo is `life-app`.
- Canonical local path (when local context matters): `C:\Users\louie\life-app`.
- Working branch is `main`. Do not propose switching unless the user asks.
- `./.github/copilot-instructions.md` is the source of truth for architecture and conventions.
- Be brutally honest, extremely concise, and direct.
- Fix the requested problem first. While doing so, fix small nearby issues that are clearly in scope and low risk.
- If a discovered issue materially expands scope, finish the requested fix and surface the bigger issue separately with evidence and a recommended follow-up.
- When a reusable lesson appears, recommend promoting it to repo guidance or memory.

## Latest-Update Policy (Mandatory First Step)

Before making **any** change or answering anything that depends on current code state:

1. Confirm the active branch is `main`. If it is not, stop and surface it.
2. Check recent branch history. Do not assume the local workspace is current.
3. Pull the latest `main` before editing. Always work on the latest update, even if the latest commit was made by someone else.
4. If the workspace is behind, state that plainly and pull before continuing.
5. If there are local uncommitted changes that would conflict with pulling, stop and surface them — do not discard work.

Recommended commands (run in the repo root):

```powershell
# See current branch and status
git status

# See latest commits on main
git log --oneline -n 10

# Fetch remote state without changing working tree
git fetch origin

# Compare local vs remote main
git log --oneline HEAD..origin/main
git log --oneline origin/main..HEAD

# Pull latest main (fast-forward only is safest)
git pull --ff-only origin main
```

If `git pull --ff-only` fails, do not force. Report the divergence, list the conflicting local changes, and ask how to proceed.

## Procedure

1. **Re-anchor context.** Confirm this is `life-app`. If local path matters, assume `C:\Users\louie\life-app`. Flag any conflict with the current workspace.
2. **Check latest.** Run the latest-update policy above before editing anything. Always work off the newest `main`.
3. **Respect conventions.** Read `./.github/copilot-instructions.md` and follow its architecture, routing, theme, and mobile rules.
4. **Solve the task.** Diagnose root causes, make the smallest effective change, validate.
5. **Sweep.** Fix small, safe, adjacent issues in the same pass. Do not silently bundle large refactors.
6. **Close out.** Summarize what changed, how it was verified, and what (if anything) should be followed up later.

## Decision Rules

- **Workspace behind `origin/main`:** pull before editing.
- **Diverged history or conflicts:** stop and surface, never force.
- **Wrong branch:** surface immediately, do not silently continue.
- **Tiny issue:** fix, stay short.
- **Bigger structural issue discovered:** finish the requested fix, then report the bigger issue separately.
- **Reusable lesson:** recommend storing it in repo guidance or memory.

## Completion Checks

- Branch is `main` (or mismatch was explicitly surfaced).
- Local workspace was verified current with `origin/main` before editing.
- The response stayed concise, honest, and direct.
- The requested task was completed.
- Safe adjacent issues were fixed.
- Larger issues were called out, not buried.

## Related Skills

- [pre-commit-check](../pre-commit-check/SKILL.md) — run before committing changes.
- [mobile-audit](../mobile-audit/SKILL.md) — mobile/iOS/theme compliance sweep for UI work.

## VS Code debug URL note

- Keep VS Code app-debug configs pointed at local dev (`http://localhost:3000`) so breakpoints and source maps work correctly.
- If you want fast access to production, add a separate non-debug browser launch entry for `https://life-ten-green.vercel.app` instead of replacing the local debug URL.
