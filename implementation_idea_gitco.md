# Implementation Ideas — Gitco

Life. is becoming an app-first learning platform focused on MOSTLY finance, But has other things like psychology, philosophy, and self-development. The direction is not just "a website with content" — it should feel like a real product users return to daily for reading, progress, community, and personal growth. Its mainly big on "ways to make money" it gets investors and inventors together like tinder, it gives off information about anything and everything, and ultimately should be fitted to be an ios app. that is why fitting, for universal mobile device is important. making it look and function well for mobile users no matter the phone.

## Core product direction

- Build toward an installable, app-like experience.
- Keep the learning flow simple: discover -> read -> reflect -> practice -> track progress.
- Make personalization, streaks, saved knowledge, and community feel central.

## Future todo list

### Architecture
- [ ] Break up `src/App.jsx` (8600+ lines) into smaller feature modules without changing the user experience.
- [ ] Turn the product into a stronger app shell with clearer page structure and cleaner navigation.

### Onboarding & Daily Loop
- [ ] Improve onboarding so new users understand what Life. helps them achieve in the first minute.
- [ ] Add a daily learning goal system with reminders, streak visibility, and small wins.
- [ ] Add "resume reading" on the home screen so users pick up where they left off.
- [ ] Add weekly progress summaries on the home screen using reading, quiz, and streak data.
- [ ] Make the daily loop outcome-first (money/goals) not just learning-first.

### Content & Reader
- [ ] Improve recommendations so content changes based on the user's tailoring/profile results.
- [ ] Expand quiz follow-up with review mode for missed questions and weak topics.
- [ ] Add better analytics/progress insight so users can see what they learned, not just what they opened.

### Investor / Inventor Matching (Core Feature)
- [ ] Build a real matching system between investors and inventors (the "Tinder for business" concept).
- [ ] Replace the current Discord-invite-only approach with in-app profiles, pitches, and matching.
- [ ] Add project/idea cards that inventors can post and investors can browse.

### Monetization
- [ ] Wire up real subscription/premium flows (currently placeholder buttons).
- [ ] Define what's free vs premium content.
- [ ] Add payment integration (Stripe or similar).

### Community
- [ ] Make Post-It feel more like a real community feed with better empty states, moderation-ready structure, and richer profile context.
- [ ] Add notification badges for new community activity.
- [ ] Add user reputation or contribution tracking.

### Mobile & PWA
- [ ] Continue polishing mobile layout, touch targets, and safe-area behavior so it feels like a native app.
- [ ] Add swipe navigation between sections.
- [ ] Add offline indicators and poor-network graceful degradation.
- [ ] Strengthen offline and poor-network behavior so reading and notes still feel reliable.
- [ ] Prepare for app distribution by improving PWA/installability and app-style metadata/assets.

### Backend & Data
- [x] Create `user_data` table in Supabase with proper RLS policies.
- [ ] Add Supabase MCP integration for direct database management.
- [ ] Harden Supabase data structure and RLS assumptions as more user data features are added.
- [ ] Add proper error handling and retry logic for network failures in data sync.

### Accessibility & Polish
- [ ] Improve accessibility across auth, reader, quiz, feed, and settings flows.
- [ ] Add loading skeletons instead of spinners for a more polished feel.
- [ ] Ensure consistent dark/light theme across all components.

## Completed

- [x] Saved quotes/highlights in Reader.
- [x] Homepage simplification (minimal hero).
- [x] Sidebar navigation refactor (navigate + stay open).
- [x] Dark mode consistency fix.
- [x] Theme preference (system/light/dark).
- [x] Scroll fix (desktop + mobile).
- [x] Settings Hub removed from profile (gear icon only).
- [x] Supabase/Vercel/GitHub infrastructure alignment.
- [x] CI + Dependabot automation.
- [x] Production metadata updated to match product vision.

## Near-term focus

1. Stabilize the current product flows.
2. Build the investor/inventor matching MVP.
3. Deepen the learning loop: read, save, review, return.
4. Push the experience closer to a true app on mobile.
