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
          @media (max-width: 640px) {
            .life-auth-shell,
            .life-landing-shell {
              justify-content: flex-start !important;
              min-height: calc(100svh + 140px) !important;
              overflow-y: auto !important;
              overflow-x: hidden !important;
              padding-top: max(24px, calc(env(safe-area-inset-top, 0px) + 12px)) !important;
              padding-bottom: calc(132px + env(safe-area-inset-bottom, 0px)) !important;
              box-sizing: border-box !important;
            }

            .life-auth-card {
              max-height: none !important;
              overflow: visible !important;
              width: min(100%, 360px) !important;
              max-width: 360px !important;
            }
          }
        `}</style>
      </head>
      <body>{children}</body>
    </html>
  )
}
