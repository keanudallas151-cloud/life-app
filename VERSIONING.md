# Versioning

Life is still in prototype phase. The project uses semantic versioning with a `v` prefix on Git tags and GitHub releases.

## Canonical format

- Git tag: `v0.7.0`
- GitHub release title: `v0.7.0 - Firebase platform migration and release hardening`
- `package.json` version: `0.7.0`

## Prototype bump rules

- Use `v0.7.x` for the current prototype snapshot line.
- Increment the patch version for each substantial completed release batch.
- Use the next minor version only for a clearly new release phase.
- Use `v1.0.0` only for the first real public release.

## Release naming rules

- Keep tags exact: `v0.7.0`
- Keep release titles short and readable.
- Keep `package.json` aligned with the same numeric version, without the `v`
- Avoid tiny release commits; prefer one commit per meaningful completed project batch.

## Branch naming rules

- Long-lived branches should be only:
  - `main`
  - `main_backup`
- Feature, fix, and chore branches should be treated as temporary and deleted after merge when no longer needed.

## Prototype sequence

- `v0.4.0`: early prototype baseline before the current release rules
- `v0.4.1`: Next.js, Supabase, GitHub workflow, and planning-doc cleanup release
- `v0.5.8`: Big Updates release before the UI overhaul sequence
- `v0.6.0`: Complete UI overhaul release
- `v0.6.1`: Bug sweep fixes
- `v0.6.2`: Small update
- `v0.6.7`: Navigation + settings + Gemini guide
- `v0.6.8`: Security, deploy, and Supabase core hardening
- `v0.6.9`: Auth and backend status hardening
- `v0.6.10`: Mobile geometry and alignment polish
- `v0.6.11`: Security scripts, secret scanning, and untrack guidance
- `v0.7.0`: Firebase platform migration and release hardening

## Current target

The current `main` branch should be treated as the `v0.7.0` prototype baseline, with `main_backup` kept aligned as the backup branch.
