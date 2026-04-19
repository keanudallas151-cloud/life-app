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
- **Files:** `src/components/SignInPage.jsx`, `src/components/RegisterPage.jsx`, `src/components/ResetPasswordPage.jsx`

### 10. Swipe-to-delete on notifications — conflicts with vertical scroll
- **Bug:** User tries to scroll notification list vertically → horizontal swipe triggers instead. It doesnt have the swipping animationas you do the investors & inventors like or dislike. User wants a smooth left scroll.
- **Fix:** Only trigger swipe if `Math.abs(dx) > Math.abs(dy) * 1.5` — otherwise pass to scroll.

### Dark Mode
- As of right now dark more is stock, meaning the light doesnt really work. so when people choose light make it gray instead. so a bit of lighter gray making sure all the tones match eachother.

### Pitcure For Profile
- It has been implemented so remove the part where it says (Custom pitcure coming soon)
- Another issue i had with this was that the pitcure is 5
## Testing checklist

- [ ] Test on iPhone 17 (393px)
- [ ] Test on Galaxy A16 (360px)
- [ ] Test on iPhone 17 Pro Max (430px)
- [ ] Test in light mode
- [ ] Test in dark mode
- [ ] Test with keyboard navigation (a11y)
- [ ] Test with `prefers-reduced-motion`
- [ ] Check console for errors
- [ ] Check network tab for 404s on sounds/images
