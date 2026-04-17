# Life. — Persisting Issues (Handoff)

**Last commit:** `f07b6e8` (Sign In button white)
**Status:** Prompts 1-3 landed but many issues still persist on mobile + desktop.
**Next session:** Start by pulling latest `main`, then work through this list.

---

## 🚨 Priority order

Work top-to-bottom. Each item is a standalone ticket.

### 1. Sidebar gaps on mobile STILL appear
- **Symptom:** Big empty gaps between sections (LIFE, LIBRARY, SOCIALS, GUIDED, SAVED).
- **Root cause to investigate:** The CSS I committed may be overridden by the inline `style={}` on the sidebar `<div>` in `src/App.jsx` (~line 4600). Inline styles beat `!important` CSS on mobile specifically if the inline style is `width: 288` + `maxWidth: "min(288px, 100vw)"`.
- **Fix:** Strip `width`, `maxWidth`, `paddingTop`, `paddingBottom` from the sidebar inline style and let CSS control all of it. Use a CSS class for desktop width too.
- **Files:** `src/App.jsx` (sidebar div), `src/index.css` (`.life-sidebar` + mobile block).

### 2. Password toggle still flickers / jumps
- **Symptom:** User reports the Show/Hide button still moves.
- **Likely cause:** `SignInPage.jsx` or `RegisterPage.jsx` has an inline `style={{ position: "absolute", right: 10, top: 14 }}` on the button that overrides the CSS class.
- **Fix:** Remove all inline positioning from the toggle button. Let `.life-password-toggle` class do everything.
- **Files:** `src/components/SignInPage.jsx`, `src/components/RegisterPage.jsx`, `src/components/ResetPasswordPage.jsx`.

### 3. Dark mode — text is harsh / blinding in places
- **Task:** Audit every page. Replace any hardcoded `#fff` text with `t.ink` (which is `#f2f2f2` in dark mode, not pure white).
- **Grep:** `grep -rn 'color: "#fff"\|color:"#fff"\|color: "#ffffff"' src/` — fix every hit that isn't a button-on-coloured-background.
- **Also:** Pure `#000` text anywhere → replace with `t.ink`.

### 4. Notification badge still off-center
- **Symptom:** Number still touches the bottom of the red circle.
- **Fix attempt made:** `lineHeight: 1`, `paddingBottom: 1`. May need `paddingTop: 0` explicit and try `lineHeight: "16px"` matching the height exactly.
- **Alternative:** Use `display: grid; placeItems: center` instead of flex.

### 5. Gear icon still oval on some screens
- **Fix attempt made:** `aspectRatio: 1/1` with min/max = 40.
- **If still oval:** The parent flex container is squashing it. Wrap the button in `<div style={{flexShrink:0, width:40, height:40}}>` and put the button inside at 100% width/height.

### 6. Continue Reading dismiss button — verify
- Test: Tap the × — does it vanish without opening the topic? The absolute-positioned full-card button may still intercept the tap.
- **If bug:** Move the × outside the card entirely OR use `pointer-events: none` on the overlay tap-area element during × tap.

### 7. Daily Growth modal — Android back button
- **Bug:** Back button closes the whole app instead of the modal.
- **Fix:** `useEffect` that adds a history entry when modal opens and listens for `popstate` to close it.

### 8. Reading experience problems
- **Prose reformatting** — content.js still reads as bullets. Major rewrite needed.
- **Title pages** — not implemented at all yet. Need `{topicname}_title_page` format.
- **Inline visuals** — still only render on last page. Need `{{chart:key}}` marker support in the reader.
- **Parchment texture** — verify it's actually showing. Class is applied but if nothing visible, check `background-image` isn't being overridden by inline styles on the same div.

### 9. Page-turn sounds — verify MP3s exist
- `/public/sounds/next_page.mp3`
- `/public/sounds/previous_page.mp3`
- If either is missing, the audio just silently fails.

### 10. Swipe-to-delete on notifications — conflicts with vertical scroll
- **Bug:** User tries to scroll notification list vertically → horizontal swipe triggers instead.
- **Fix:** Only trigger swipe if `Math.abs(dx) > Math.abs(dy) * 1.5` — otherwise pass to scroll.

### 11. Quiz dark mode — verify every sub-view
- The C→t swap was mechanical. Edge cases likely remain in:
  - Question answer-result screen
  - Completion / score screen
  - Achievements view
  - Daily challenge banner
- **Test:** Play a quiz in dark mode, screenshot each screen.

### 12. Tailor dark mode — verify
- Same mechanical swap. Test all 3 screens: intro, questions, result.

### 13. Mobile hamburger — verify alignment
- Should be vertically centered with logo + search. If still off:
  - Topbar needs `align-items: center`
  - Logo button and search input need same height

### 14. Progress Dashboard challenges — routing issue
- `"communication"` action currently routes to the Quiz page.
- User may expect a dedicated Communication practice page with vocal warmups + conversation prompts.
- **Decision needed:** Build a `CommunicationPage.jsx` that uses the `communication_audio` data from `quiz.js`?

### 15. GoalSettingPage — not reachable except from dashboard
- No sidebar entry, no top-level nav.
- Add to sidebar (under LIFE section?) and to momentum hub if relevant.

### 16. From the Author — quotation marks may look weird
- Large `&ldquo;` top-left + small `&rdquo;` inline may not balance visually.
- **Alternative:** Both large, symmetric. Or just inline text quotes.

### 17. Sign Out button — pinned to bottom on mobile?
- Fix used `marginTop: "auto"` — requires sidebar to be flex-column. Verify the CSS `display: flex; flex-direction: column` is actually applying and not being overridden.

---

## 🧪 Testing checklist for next session

Before closing any ticket:

- [ ] Test on iPhone 17 (393px)
- [ ] Test on Galaxy A16 (360px)
- [ ] Test on iPhone 17 Pro Max (430px)
- [ ] Test in light mode
- [ ] Test in dark mode
- [ ] Test with keyboard navigation (a11y)
- [ ] Test with `prefers-reduced-motion`
- [ ] Check console for errors
- [ ] Check network tab for 404s on sounds/images

---

## 🎯 Still pending from original Prompt 1-5 plan

### Never started
- **Badges redesign** + extreme milestones ($1k, $1M, complete every subject, personal goal)
- **Book-style prose rewrite** (`content.js`)
- **Title pages** for every subject with `{topicname}_title_page` tag
- **Inline visuals** mid-content (markers in text)
- **Communication audio MP3s** — structure exists, files missing
- **Prompt 4** — second-pass bug sweep
- **Prompt 5** — final polish (alignment, consistency, a11y, perf)

### Waiting on trigger word
- **Content expansion to 10-20 pages per subject** — DO NOT START until user types `prompt_pages`

---

## 📂 Where things live

| Feature | File |
|---|---|
| Sidebar rendering | `src/App.jsx` (~line 4600) |
| Sidebar CSS | `src/index.css` (`.life-sidebar` + `@media max-width:640px`) |
| Password toggle CSS | `src/index.css` (`.life-password-toggle`, `.life-password-field`) |
| Password toggle usage | `src/components/SignInPage.jsx`, `RegisterPage.jsx`, `ResetPasswordPage.jsx` |
| Notification badge | `src/App.jsx` (~line 2322) |
| Notification panel | `src/App.jsx` (`showNotif && ...`) |
| Swipeable notification | `src/App.jsx` (top — `SwipeableNotification`) |
| Profile gear | `src/components/ProfilePage.jsx` |
| Reader | `src/components/Reader.jsx` |
| Parchment CSS | `src/index.css` (`.life-reader-parchment`) |
| Page-turn sounds | `src/systems/useSound.js` |
| Daily Growth | `src/components/DailyGrowthPage.jsx` |
| Goals | `src/components/GoalSettingPage.jsx` |
| Progress Dashboard | `src/components/ProgressDashboardPage.jsx` |
| Quiz | `src/components/QuizPage.jsx` + `src/data/quiz.js` |
| Tailor | `src/components/Tailor.jsx` |
| Landing page | `src/components/LandingPage.jsx` |
| Content data | `src/data/content.js` |
| Theme | `src/systems/theme.js` (exports `C` constant + `S` shadows) |

---

## 🚀 Commit used last session

```
git clone https://github.com/keanudallas151-cloud/life-app.git
cd life-app
# work...
git add -A
git commit -m "..."
git push origin main
```

Token used: (redacted — user will supply next session if still valid).

---

## 💬 First message to paste next session

> Pull from `main` on `keanudallas151-cloud/life-app`. Read `HANDOFF.md` in the repo root. Work through the priority list top-to-bottom. Commit after each completed ticket with a clear message. I will DM the GitHub token.
