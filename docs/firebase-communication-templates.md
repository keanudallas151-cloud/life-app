# Firebase communication templates

This document tracks the source-controlled template pack for `v0.7.1`.

## Support and sender identity

Use this support address anywhere the app needs a visible contact or reply destination:

- `life.customer.support@gmail.com`

## Template groups

### Native Firebase Authentication templates

These are configured inside **Firebase Console → Authentication → Templates** and can be copied from the HTML source files in `docs/firebase-templates/auth/`.

Available source templates:

- `verify-email.html`
- `password-reset.html`
- `recover-email.html`

These templates are intended for Firebase Auth's built-in flows.

### App-managed email templates

These are versioned in `docs/firebase-templates/app/` and are meant for events Firebase Auth does **not** send on its own.

Available source templates:

- `welcome-confirmed.html`
- `new-message.html`
- `support-acknowledgement.html`

These will require an app-managed delivery path later, such as:

- Firebase Extension for email sending
- Cloud Function trigger
- external email provider integrated with Firebase / Firestore events

### In-app notification templates

Common notification copy is versioned in:

- `docs/firebase-templates/in-app/notification-templates.json`

This gives `v0.7.1` a single place to define reusable message copy for notifications, reminders, and lightweight account status updates.

## Important behavior note

Firebase Auth can natively send verification, reset, and recovery emails, but it does **not** automatically send a custom post-confirmation "your account is confirmed" welcome email. That template is included in this repo as an app-managed template and should be hooked up later through backend email delivery.

## Placeholder conventions

### Firebase Auth placeholders

For Firebase-native templates, use Firebase-compatible placeholders such as:

- `%APP_NAME%`
- `%LINK%`
- `%EMAIL%`
- `%NEW_EMAIL%`

### App-managed placeholders

For app-managed templates, the HTML files use simple placeholders such as:

- `{{displayName}}`
- `{{actionUrl}}`
- `{{senderName}}`
- `{{messagePreview}}`
- `{{ticketId}}`
- `{{issueSummary}}`
- `{{supportEmail}}`

## Recommended rollout order

1. Paste the native auth templates into Firebase Authentication.
2. Decide how Life. will send app-managed emails.
3. Wire the support email as the visible reply/contact address.
4. Reuse the in-app notification template catalog when notification flows move beyond static defaults.
