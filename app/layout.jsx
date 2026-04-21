import '../src/index.css'

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null) ||
  'http://localhost:3000';

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: 'Life. — Build Wealth. Learn Everything. Connect.',
  description: 'Life. helps you make money, learn anything, and connect with investors and creators. Finance, psychology, philosophy — everything you need to build the life you want.',
  appleWebApp: {
    capable: true,
    title: 'Life.',
    statusBarStyle: 'black-translucent'
  },
  robots: 'index,follow',
  openGraph: {
    title: 'Life. — Build Wealth. Learn Everything. Connect.',
    description: 'Make money, learn anything, and connect with investors and creators. The first million is the hardest — the second is imminent.',
    type: 'website',
    images: [{ url: '/favicon.svg', width: 512, height: 512, alt: 'Life. logo' }],
  },
  twitter: {
    card: 'summary',
    title: 'Life. — Build Wealth. Learn Everything. Connect.',
    description: 'Make money, learn anything, and connect with investors and creators.',
    images: ['/favicon.svg'],
  }
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#50c878'
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/site.webmanifest" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Life." />
        <meta name="format-detection" content="telephone=no, date=no, email=no, address=no" />
        <style>{`
          html,
          body {
            min-height: 100dvh;
            height: 100dvh;
          }

          body {
            padding-bottom: 0 !important;
          }

          body > div {
            min-height: 100dvh;
          }

          @media (max-width: 640px) {
            .life-auth-shell,
            .life-landing-shell {
              justify-content: flex-start !important;
              min-height: 100dvh !important;
              height: 100dvh !important;
              overflow-y: auto !important;
              overflow-x: hidden !important;
              padding-top: max(24px, calc(env(safe-area-inset-top, 0px) + 12px)) !important;
              padding-bottom: max(24px, calc(env(safe-area-inset-bottom, 0px) + 16px)) !important;
              box-sizing: border-box !important;
            }

            .life-auth-card {
              max-height: none !important;
              overflow: visible !important;
              width: min(100%, 360px) !important;
              max-width: 360px !important;
            }

            .life-reader-toolbar {
              padding-left: 0 !important;
              padding-right: max(10px, env(safe-area-inset-right, 0px)) !important;
              gap: 0 !important;
            }

            .life-reader-toolbar-actions {
              margin-left: auto !important;
              padding-left: 10px !important;
              gap: 8px !important;
              border-left: 1px solid var(--life-border) !important;
            }

            .life-reader-mode-btn,
            .life-reader-star-btn {
              width: 40px !important;
              height: 40px !important;
              min-width: 40px !important;
              min-height: 40px !important;
              box-shadow: none !important;
            }
          }

          @media (display-mode: standalone) {
            html,
            body {
              min-height: 100dvh !important;
              height: 100dvh !important;
              overflow: hidden;
            }

            body {
              padding-bottom: 0 !important;
              background: #000;
            }

            body > div {
              min-height: 100dvh !important;
            }

            .life-auth-shell,
            .life-landing-shell {
              min-height: 100dvh !important;
              height: 100dvh !important;
              padding-bottom: max(24px, calc(env(safe-area-inset-bottom, 0px) + 16px)) !important;
            }
          }
        `}</style>
      </head>
      <body>{children}</body>
    </html>
  )
}
