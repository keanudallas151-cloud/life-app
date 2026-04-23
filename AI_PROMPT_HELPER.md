# Life App Internals

Open this file in VS Code when you want the fastest map of how the app is put together.

## Start here

- `src/App.jsx`
  - Main application controller.
  - Holds auth state, screen routing, bookmarks, notes, read tracking, search, profile state, and most UI flow.
  - If you want to understand "what the app does," this is the first file to inspect.

- `app/page.jsx`
  - Active Next.js route entry for `/`.
  - Dynamically loads `src/App.jsx` with SSR disabled and wraps it in the shared error boundary and toast provider.

- `src/main.jsx`
  - Legacy standalone React entry point kept in the repo.
  - Still mounts `App.jsx` into the DOM, but it is not the primary startup path used by `npm run dev` / `next dev`.

- `src/firebaseClient.js`
  - Creates the Firebase app/auth/firestore/storage clients.
  - Reads `NEXT_PUBLIC_FIREBASE_*` env vars.

## Internal flow

1. `app/page.jsx` renders `src/App.jsx` through a dynamic client-only import.
2. `src/App.jsx` restores Firebase auth state on load.
3. Authenticated users move into the main app screen.
4. App content is loaded from `src/data/content.js`.
5. UI sections are rendered through components in `src/components/`.
6. Local user state is persisted through helpers in `src/systems/storage.js`.

## Most important files

### Core app shell
- `app/page.jsx` - active Next.js page shell for the home route
- `src/App.jsx` - main logic and screen switching
- `src/App.css` - main app styling
- `src/index.css` - global styling
- `src/main.jsx` - legacy standalone entry kept alongside the Next.js shell
- `index.html` - legacy Vite HTML shell still present in the repo
- `vite.config.js` - legacy Vite config still present in the repo
- `package.json` - scripts and dependencies

### Auth and backend
- `src/firebaseClient.js` - active Firebase client used by the app (`NEXT_PUBLIC_FIREBASE_*` env vars)
- `.env` - local env values for development (see `.env.example`)

### Content and data
- `src/data/content.js` - main content tree, guided content, content map
- `src/data/posts.js` - post/feed data
- `src/data/quiz.js` - quiz data
- `src/data/tailoring.js` - tailoring question/result data

### Reusable UI components
- `src/components/Field.jsx`
- `src/components/Reader.jsx`
- `src/components/QuizPage.jsx`
- `src/components/PostItFeed.jsx`
- `src/components/Tailor.jsx`
- `src/components/AudioPlayer.jsx`
- `src/components/Charts.jsx`

### Shared systems/helpers
- `src/systems/storage.js` - localStorage helpers
- `src/systems/theme.js` - theme constants/tokens
- `src/systems/useSound.js` - sound hook
- `src/systems/usePostIt.js` - post-it behavior
- `src/systems/useQuizStats.js` - quiz stats hook
- `src/systems/useUserData.js` - user-scoped data helper
- `src/systems/resumeReading.js` - last-opened topic for the home “Continue” card
- `src/systems/readingStreak.js` - consecutive-day streak when opening topics

### Assets and icons
- `src/icons/Ic.jsx` - icon component(s)
- `src/assets/` - bundled images/assets
- `public/` - public static assets used by the auth UI and site shell

## What lives inside `src/App.jsx`

These are the main responsibilities currently combined in that file:

- Auth state management
- Session restore on refresh
- Google OAuth sign-in
- Email/password sign-in
- Registration flow
- Sign-out flow
- Screen/page switching
- Sidebar state
- Search state
- Bookmark state
- Notes state
- Read-progress state
- Profile/tailoring state
- Content selection and reader navigation

## If you want the fastest code-reading path

Read files in this order:

1. `app/page.jsx`
2. `src/App.jsx`
3. `src/data/content.js`
4. `src/components/Field.jsx`
5. `src/components/Reader.jsx`
6. `src/firebaseClient.js`
7. `src/systems/storage.js`

## Quick repo notes

- The active app shell is Next.js 16 + React 19.
- `app/page.jsx` is the active entry point and dynamically loads `src/App.jsx`.
- Legacy Vite startup files (`src/main.jsx`, `index.html`, `vite.config.js`) are still present in the repo but are not the main startup path.
- React 19 and Firebase are the main runtime dependencies.
- A lot of the app logic is centralized in `src/App.jsx`, so that is the closest thing to an "all internals" file right now.

## Best single file to inspect

If you only open one file, open:

- `src/App.jsx`

That is where most of the internals currently meet.
