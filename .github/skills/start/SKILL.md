---
name: start
description: 'Bootstrap every life-app conversation. Use at the start of any life-app task to anchor repo, branch, latest-update policy, and concise proactive working style. Triggers: start, begin, new conversation, re-orient, session baseline, life-app context.'
argument-hint: 'What life-app task should be handled?'
---

# Start

Runs at the start of every life-app conversation. Locks the agent into the correct repo, branch, latest update, and behavior posture before it touches anything.

---

## ═══ iOS APP DEVELOPER MINDSET (MANDATORY) ═══

> **Think exactly like an Apple iOS app engineer at Cupertino.**
> Every screen, button, animation, and micro-interaction must feel native iOS — not a generic web page dressed up. When building or reviewing any UI in life-app, apply these rules without exception.

### The Golden Rule
If it would look wrong in a real App Store iOS app, it is wrong here. Period.

---

## iOS Design Template — JSX/React Edition

Native iOS apps are built in Swift/SwiftUI. This app is React/JSX, but the **visual and interaction contracts are identical**. Use this template to translate Apple Human Interface Guidelines into React inline-styles.

### Typography — SF Pro

```jsx
// ✅ ALWAYS use this font stack
const FONT = "-apple-system, 'SF Pro Display', 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif";

// Font weight scale (matches iOS Dynamic Type roles)
// Large Title: 34px / 700
// Title 1:     28px / 700
// Title 2:     22px / 700
// Headline:    17px / 600  ← most list headers
// Body:        17px / 400  ← main content
// Callout:     16px / 400
// Subhead:     15px / 400
// Footnote:    13px / 400
// Caption 1:   12px / 400
// Caption 2:   11px / 400

// Letter-spacing: -0.02em to -0.04em on headings; 0 on body; +0.06em on UPPERCASE labels
// Line-height: 1.05 on large titles; 1.55–1.65 on body text
```

### Color & Theme

```jsx
// Theme object `t` is always in scope in life-app components.
// NEVER hardcode dark/light colors — always use:
t.ink      // primary text (#ededed in dark, #eeeeee in light)
t.mid      // body text (#c9c9c9)
t.muted    // secondary/caption text (#a1a1a1)
t.white    // card / surface (#111111 dark, #1e1e1e light)
t.light    // elevated input / tint (#1a1a1a dark, #282828 light)
t.skin     // page background (#0a0a0a dark, #141414 light)
t.border   // hairline separator (#2e2e2e dark, #363636 light)
t.green    // brand accent (#50c878)
t.red      // destructive (#e5484d)
t.gold     // warning (#f5a623)
```

### iOS Spring Animation — THE standard curve

```jsx
// Standard iOS spring (use for almost everything interactive)
transition: "all 0.4s cubic-bezier(0.34,1.56,0.64,1)"

// Gentle entrance (page slides, cards)
transition: "all 0.35s cubic-bezier(0.25,0.46,0.45,0.94)"

// Snappy dismiss / back
transition: "all 0.28s cubic-bezier(0.4,0,0.2,1)"

// Keyframe example — slide up from bottom (sheets, modals)
@keyframes slideUp {
  from { transform: translateY(100%); opacity: 0.6; }
  to   { transform: translateY(0);    opacity: 1;   }
}
animation: "slideUp 0.38s cubic-bezier(0.34,1.1,0.64,1) both"

// Staggered card entrance (add index * 65ms delay)
opacity: mounted ? 1 : 0,
transform: mounted ? "translateY(0) scale(1)" : "translateY(16px) scale(0.94)",
transition: `opacity 0.35s ease ${index * 65}ms, transform 0.4s cubic-bezier(0.34,1.56,0.64,1) ${index * 65}ms`
```

### Button Spec — Primary CTA

```jsx
// iOS primary button: 52px tall, full-width or pill-shaped, spring press
<button
  type="button"
  onTouchStart={(e) => { e.currentTarget.style.transform = "scale(0.96)"; }}
  onTouchEnd={(e)   => { e.currentTarget.style.transform = "scale(1)"; }}
  onMouseDown={(e)  => { e.currentTarget.style.transform = "scale(0.96)"; }}
  onMouseUp={(e)    => { e.currentTarget.style.transform = "scale(1)"; }}
  style={{
    width: "100%",
    height: 52,
    borderRadius: 14,           // iOS filled button radius
    background: t.green,
    color: "#000",              // always #000 on green/accent
    fontSize: 17,
    fontWeight: 600,
    fontFamily: FONT,
    border: "none",
    cursor: "pointer",
    letterSpacing: "-0.01em",
    transition: "transform 0.15s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.2s ease",
    WebkitTapHighlightColor: "transparent",
    boxShadow: `0 4px 16px ${t.green}40`,
  }}
>
  Continue
</button>

// Secondary / ghost button
style={{
  height: 52, borderRadius: 14,
  background: t.light,
  color: t.ink,
  border: `1px solid ${t.border}`,
  fontSize: 17, fontWeight: 500,
  // ... same tap handlers
}}
```

### Inset-Grouped List (iOS Settings / UITableView insetGrouped style)

```jsx
// Section header
<p style={{
  fontSize: 13, fontWeight: 600, color: t.muted,
  textTransform: "uppercase", letterSpacing: "0.06em",
  padding: "0 20px", marginBottom: 6,
}}>Section Title</p>

// List container
<div style={{ background: t.white, borderRadius: 16, overflow: "hidden", margin: "0 16px" }}>
  {items.map((item, i) => (
    <div key={item.id} style={{
      display: "flex", alignItems: "center", gap: 14,
      padding: "14px 18px",
      borderBottom: i < items.length - 1 ? `1px solid ${t.border}` : "none",
      cursor: "pointer",
      WebkitTapHighlightColor: "transparent",
    }}>
      {/* Left icon */}
      <div style={{
        width: 32, height: 32, borderRadius: 8,
        background: item.color, display: "flex", alignItems: "center",
        justifyContent: "center", fontSize: 16, flexShrink: 0,
      }}>{item.icon}</div>
      {/* Label */}
      <span style={{ flex: 1, fontSize: 17, fontWeight: 400, color: t.ink, fontFamily: FONT }}>{item.label}</span>
      {/* Chevron */}
      <svg width="8" height="14" viewBox="0 0 8 14" fill="none" stroke={t.muted} strokeWidth="2" strokeLinecap="round">
        <polyline points="1 1 7 7 1 13" />
      </svg>
    </div>
  ))}
</div>
```

### iOS Bottom Sheet (Modal / Action Sheet)

```jsx
// Overlay backdrop
<div onClick={onClose} style={{
  position: "fixed", inset: 0,
  background: "rgba(0,0,0,0.5)",
  backdropFilter: "blur(8px)",
  WebkitBackdropFilter: "blur(8px)",
  zIndex: 900,
}} />

// Sheet panel
<div style={{
  position: "fixed", left: 0, right: 0, bottom: 0,
  maxHeight: "92dvh",
  background: t.white,
  borderRadius: "22px 22px 0 0",
  borderTop: `1px solid ${t.border}`,
  zIndex: 901,
  display: "flex", flexDirection: "column", overflow: "hidden",
  animation: "slideUp 0.38s cubic-bezier(0.34,1.1,0.64,1) both",
}}>
  {/* Pull handle — always present on sheets */}
  <div style={{
    width: 40, height: 5, borderRadius: 999,
    background: t.border, margin: "12px auto 0",
  }} />
  {/* Content */}
</div>
```

### Navigation Header (iOS UINavigationBar style)

```jsx
// Back button — chevron + label, left-aligned, brand color
<button type="button" onClick={onBack} style={{
  display: "flex", alignItems: "center", gap: 5,
  background: "none", border: "none", cursor: "pointer",
  color: t.green, fontSize: 17, fontWeight: 400,
  fontFamily: FONT, padding: 0,
  WebkitTapHighlightColor: "transparent",
}}>
  <svg width="10" height="18" viewBox="0 0 10 18" fill="none"
    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 1 1 9 9 17" />
  </svg>
  Section Name
</button>

// Inline title — 17px / semibold, centered
<span style={{ fontSize: 17, fontWeight: 600, color: t.ink, fontFamily: FONT, letterSpacing: "-0.01em" }}>
  Page Title
</span>
```

### Cards / Panels

```jsx
// Standard card
style={{
  background: t.white,
  borderRadius: 20,
  border: `1px solid ${t.border}`,
  padding: "18px 18px",
  boxShadow: "0 2px 12px rgba(0,0,0,0.12)",
}}

// Elevated / glass card (for dark bg, game modals, etc.)
style={{
  background: t.light,
  borderRadius: 18,
  border: `1px solid ${t.border}`,
  backdropFilter: "blur(10px)",
  WebkitBackdropFilter: "blur(10px)",
}}

// Accent highlight card (tinted with brand color)
style={{
  background: `${t.green}12`,
  borderRadius: 16,
  border: `1px solid ${t.green}30`,
}}
```

### Safe Area Insets

```jsx
// Respect iOS safe areas. Use paddingBottom to clear home indicator.
// The app scroll container (.life-main-scroll) already handles this via
// pb-safe. Inside fixed overlays / sheets, always add:
paddingBottom: "calc(20px + env(safe-area-inset-bottom))"

// For fixed bottom bars or bottom sheets:
paddingBottom: "env(safe-area-inset-bottom, 0px)"
```

### Touch Feedback — Non-Negotiable Rules

```jsx
// Every tappable element MUST have all four of these:
WebkitTapHighlightColor: "transparent"   // removes native blue flash on iOS
cursor: "pointer"                         // desktop friendliness
onTouchStart={(e) => e.currentTarget.style.transform = "scale(0.96)"}
onTouchEnd={(e)   => e.currentTarget.style.transform = "scale(1)"}

// And the global `button:active` rule in theme.js already applies:
// button:active { filter: brightness(0.92); transform: scale(0.985); }
// Do NOT override this for buttons — it already fires on tap.
```

### Sound Effects — Always Wire Through `play`

```jsx
// The app has a Web Audio sound system in src/systems/useSound.js
// play(type) is passed down as a prop. Available types:
play?.("tap")      // light tap (navigating, selecting)
play?.("ok")       // confirm / subtle success
play?.("correct")  // quiz correct answer ✓
play?.("wrong")    // quiz wrong answer ✗
play?.("star")     // achievement / perfect score ★
play?.("back")     // dismissing / going back
play?.("home")     // landing on home screen

// Rule: Every interactive UI action should trigger EXACTLY ONE sound.
// Prefer: correct/wrong for quiz answers, tap for navigation, star for wins.
// Never trigger sound from useEffect cleanup or passive observers.
```

### Squircle App Icons

```jsx
// iOS app icons use squircle (superellipse), not circle or plain square.
// Approximate with: borderRadius: "22%"  (for icon-sized elements)
// For large feature icons (64px+): borderRadius: 18–22px
style={{
  width: 64, height: 64,
  borderRadius: 18,   // squircle at 64px
  background: "linear-gradient(135deg, #50c878 0%, #2f9e63 100%)",
  display: "flex", alignItems: "center", justifyContent: "center",
  fontSize: 30,
}}
```

### Empty States & Loading

```jsx
// iOS empty state: centered icon (52px), title (17px/600), subtitle (15px/muted)
<div style={{ textAlign: "center", padding: "48px 32px", fontFamily: FONT }}>
  <div style={{ fontSize: 52, marginBottom: 16 }}>📭</div>
  <p style={{ fontSize: 17, fontWeight: 600, color: t.ink, margin: "0 0 8px" }}>Nothing Here Yet</p>
  <p style={{ fontSize: 15, color: t.muted, margin: 0, lineHeight: 1.55 }}>
    Descriptive one-liner explaining what should appear here.
  </p>
</div>
```

### Anti-Patterns — NEVER Do These

| ❌ Wrong | ✅ iOS Correct |
|---|---|
| `fontFamily: "Georgia"` anywhere (except brand 'l.' logotype) | SF Pro stack |
| `borderRadius: 4` on interactive cards | 14–22px |
| `color: "white"` hardcoded | `t.ink` |
| `background: "#fff"` hardcoded | `t.white` |
| `transition: "all 0.2s ease"` on buttons | spring cubic-bezier |
| No `WebkitTapHighlightColor` on tappable divs | Always set to `"transparent"` |
| `overflow: scroll` on body/html | Use `.life-main-scroll` container |
| No sound on answer selection in games | Always wire `play?.("correct"/"wrong")` |
| Empty states with no icon | Always icon + title + subtitle |
| Inline `style` with magic hex colors | Always `t.*` tokens |

---

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
4. **Apply iOS template.** For any UI work, use the iOS App Developer Mindset section above as the non-negotiable template.
5. **Solve the task.** Diagnose root causes, make the smallest effective change, validate.
6. **Sweep.** Fix small, safe, adjacent issues in the same pass. Do not silently bundle large refactors.
7. **Close out.** Summarize what changed, how it was verified, and what (if anything) should be followed up later.

## Decision Rules

- **Workspace behind `origin/main`:** pull before editing.
- **Diverged history or conflicts:** stop and surface, never force.
- **Wrong branch:** surface immediately, do not silently continue.
- **Tiny issue:** fix, stay short.
- **Bigger structural issue discovered:** finish the requested fix, then report the bigger issue separately.
- **Reusable lesson:** recommend storing it in repo guidance or memory.
- **Any UI change:** apply the iOS App Developer Mindset template — no exceptions.

## Completion Checks

- Branch is `main` (or mismatch was explicitly surfaced).
- Local workspace was verified current with `origin/main` before editing.
- The response stayed concise, honest, and direct.
- The requested task was completed.
- Safe adjacent issues were fixed.
- Larger issues were called out, not buried.
- **All UI follows the iOS template above** — SF Pro, spring animations, t.* tokens, touch feedback, sounds wired.

## Related Skills

- [pre-commit-check](../pre-commit-check/SKILL.md) — run before committing changes.
- [mobile-audit](../mobile-audit/SKILL.md) — mobile/iOS/theme compliance sweep for UI work.

## VS Code debug URL note

- Keep VS Code app-debug configs pointed at local dev (`http://localhost:3000`) so breakpoints and source maps work correctly.
- If you want fast access to production, add a separate non-debug browser launch entry for `https://life-ten-green.vercel.app` instead of replacing the local debug URL.
