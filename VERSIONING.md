# Versioning

Life is still in prototype phase. The project uses simple semantic versioning with a `v` prefix on Git tags and GitHub releases.

## Canonical format

- Git tag: `v0.0.1`
- GitHub release title: `v0.0.1 - Initial prototype`
- `package.json` version: `0.0.1`

## Prototype bump rules

- Use `v0.0.x` for normal prototype snapshots.
- Move from `v0.0.9` to `v0.1.0`.
- Use `v0.1.x` once the prototype is more stable but still not production-ready.
- Use `v1.0.0` only for the first real public release.

## Release naming rules

- Keep tags exact: `v0.0.4`
- Keep release titles short and readable: `v0.0.4 - Build recovery baseline`
- Keep `package.json` aligned with the same numeric version, without the `v`

## Branch naming rules

- Stable branch: `main`
- Backup branches: `backup-main-YYYY-MM-DD`
- Feature branches: `feature/<short-name>`
- Fix branches: `fix/<short-name>`
- Chore branches: `chore/<short-name>`

## Prototype sequence

- `v0.0.1`: first repository upload
- `v0.0.2`: second prototype snapshot
- `v0.0.3`: merged prototype baseline before build recovery
- `v0.0.4`: current buildable recovery baseline

## Current target

The current `main` branch should be treated as the `v0.0.4` prototype baseline.
