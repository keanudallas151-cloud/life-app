# Versioning

Life is still in prototype phase. The project uses semantic versioning with a `v` prefix on Git tags and GitHub releases.

## Canonical format

- Git tag: `v0.4.4`
- GitHub release title: `v0.4.4 - Backend fix and product identity`
- `package.json` version: `0.4.4`

## Prototype bump rules

- Use `v0.4.x` for current prototype snapshots.
- Increment the patch version for each substantial completed release batch.
- Move from `v0.4.9` to `v0.5.0`.
- Use `v1.0.0` only for the first real public release.

## Release naming rules

- Keep tags exact: `v0.4.1`
- Keep release titles short and readable.
- Keep `package.json` aligned with the same numeric version, without the `v`
- Avoid tiny release commits; prefer one commit per meaningful completed project batch.

## Branch naming rules

- Stable branch: `main`
- Backup branch: `main_backup`
- Feature branches: `feature/<short-name>`
- Fix branches: `fix/<short-name>`
- Chore branches: `chore/<short-name>`

## Prototype sequence

- `v0.4.0`: prototype baseline before the current release rules
- `v0.4.1`: Next.js, Supabase, GitHub workflow, and planning-doc cleanup release

## Current target

The current `main` branch should be treated as the `v0.4.1` prototype baseline, with `main_backup` kept aligned as a backup branch.
