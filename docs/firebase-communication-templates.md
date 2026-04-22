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

These are now wired for a Firestore-backed delivery path using the Firebase Trigger Email extension.

Runtime collections used by the app:

- `userPrivate/{uid}` — private identity document keyed by Firebase Auth UID with an `email` field for recipient resolution
- `mail/{mailId}` — queued outbound email documents for the Trigger Email extension
- `supportRequests/{requestId}` — in-app support submissions that also trigger acknowledgements

Recommended Firebase Trigger Email extension configuration:

- **Email documents collection**: `mail`
- **Users collection**: `userPrivate`
- **Templates collection**: optional (the app currently queues fully rendered HTML + text)

### In-app notification templates

Common notification copy is versioned in:

- `docs/firebase-templates/in-app/notification-templates.json`

This gives `v0.7.1` a single place to define reusable message copy for notifications, reminders, and lightweight account status updates.

## Important behavior note

Firebase Auth still natively sends verification, reset, and recovery emails, but the app now queues custom post-confirmation and communication emails through Firestore for:

- welcome confirmed
- support acknowledgement
- new message alerts

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
2. Install the Firebase Trigger Email extension with `mail` as the email collection.
3. Set the extension's users collection to `userPrivate` so `toUids` resolves through private identity docs.
4. Configure the SMTP sender and default reply-to address.
5. Reuse the in-app notification template catalog when notification flows move beyond static defaults.
