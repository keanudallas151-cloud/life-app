# Versioning

Life is still in prototype phase. The project uses semantic versioning with a `v` prefix on Git tags and GitHub releases.

## Canonical format

- Git tag: `v0.6.2`
- GitHub release title: `v0.6.2 - Small update`
- `package.json` version: `0.6.2`

## Prototype bump rules

- Use `v0.6.x` for current prototype snapshots.
- Increment the patch version for each substantial completed release batch.
- Use the next minor version only for a clearly new release phase.
- Use `v1.0.0` only for the first real public release.

## Release naming rules

- Keep tags exact: `v0.6.2`
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

- `v0.4.0`: early prototype baseline before the current release rules
- `v0.4.1`: Next.js, Supabase, GitHub workflow, and planning-doc cleanup release
- `v0.5.8`: Big Updates release before the UI overhaul sequence
- `v0.6.0`: Complete UI overhaul release
- `v0.6.1`: Bug sweep fixes
- `v0.6.2`: Small update

## Current target

The current `main` branch should be treated as the `v0.6.2` prototype baseline, with `main_backup` kept aligned as the backup branch.
