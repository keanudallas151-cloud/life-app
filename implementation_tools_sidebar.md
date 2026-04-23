# Implementation File — Tools Sidebar Category

## Feature

Add a new sidebar category **Tools** (internal locator tag: `#tools`) between **Library** and **Socials**, with two MVP utilities:

- To-Do List
- Lock-In Time (hourglass-style focus timer)

## Product decisions (locked)

- UI label: **Tools**
- Internal tag/comment: **`#tools`**
- Sidebar order placement: **Library -> Tools -> Socials**
- Persistence: **Local + Firebase now**, with graceful local fallback

## Scope

### In scope

1. New `Tools` sidebar section and section landing page
2. `Tools` hub page
3. To-Do utility page (CRUD + completion state)
4. Lock-In utility page (start/pause/reset + progress)
5. Local persistence and Firebase sync
6. Lint/build validation and deployment readiness checks

### Out of scope (later)

- Extra tools beyond To-Do and Lock-In
- Advanced analytics/gamification
- Router redesign or large app-shell refactors

## Target files

- `src/App.jsx`
  - Sidebar insertion (between Library and Socials)
  - `page` route wiring for `sidebar_tools`, `tools_todo`, `tools_lockin`
  - Title/header mapping updates
- `src/components/SidebarSectionPage.jsx`
  - Add `sidebar_tools` metadata
- `src/components/ToolsPage.jsx` (new)
  - Tools hub surface
- `src/components/ToolsTodoPage.jsx` (new)
  - To-Do page
- `src/components/ToolsLockInPage.jsx` (new)
  - Lock-In timer page
- `src/systems/storage.js`
  - Reuse existing `LS` pattern (no new storage system)
- Existing Firebase data/client helpers
  - Reuse current app conventions for cloud sync/fallback

## Step-by-step implementation

1. **Sidebar insertion**
   - Add a new `SS` block for Tools in `src/App.jsx`
   - Place it between Library and Socials
   - Include locator tag `#tools`

2. **Routing keys and render conditions**
   - Add page keys for:
     - `sidebar_tools`
     - `tools_todo`
     - `tools_lockin`
   - Add render blocks in the same style as other section pages

3. **Sidebar section metadata**
   - Add `sidebar_tools` in `SidebarSectionPage.jsx`
   - Provide concise description and actions to open both utilities

4. **Create Tools hub page**
   - Add cards/buttons for To-Do and Lock-In
   - Keep theme usage `t.*` only

5. **Create To-Do utility**
   - Add task creation with empty-input validation
   - Add complete/uncomplete toggle
   - Add delete action
   - Persist locally and sync cloud when signed in

6. **Create Lock-In utility**
   - Add preset/custom duration input
   - Add start/pause/reset controls
   - Add hourglass-style progress visualization
   - Persist session state locally and sync cloud as needed

7. **Error-first fixes during build-out**
   - If errors appear, fix immediately before moving forward
   - Keep `src/App.jsx` edits incremental and minimal

8. **Validation**
   - Run `npm run lint`
   - Run `npm run build`
   - Manual smoke checks:
     - Sidebar order and navigation
     - To-Do CRUD and persistence
     - Lock-In timer behavior and persistence
     - Mobile widths (320px / 430px)
     - Dark mode and touch target sanity

9. **Ship checks**
   - Push to `main`
   - Verify GitHub checks pass
   - Verify Vercel deployment status is Ready
   - Confirm Firebase-backed actions work in deployed build

## Non-negotiable constraints

- Keep state-based routing (`screen` / `page`)
- Do not add React Router
- Do not move scrolling to `body`/`html`
- Use theme tokens (`t.*`), no hardcoded JSX hex colors
- Keep edits incremental in `src/App.jsx`

## Definition of done

- Tools section appears between Library and Socials
- `#tools` locator exists in source
- To-Do and Lock-In pages function correctly
- Local + Firebase persistence works with fallback
- Lint/build pass
- Deployment/check pipelines are green/ready
