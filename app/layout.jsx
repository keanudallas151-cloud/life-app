import '../src/index.css'

// Next.js needs an absolute base to resolve social-card image URLs.
// Prefer the prod URL but fall back to whatever Vercel assigns the build,
// and finally localhost for dev.
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
  viewportFit: 'cover',
  themeColor: '#4a8c5c'
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/site.webmanifest" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="apple-touch-icon" href="/favicon.svg" />
        <link rel="stylesheet" href="/password-toggle-fix.css" />
        <link rel="stylesheet" href="/home-hero-polish.css" />
      </head>
      <body>
        {children}
        <script src="/password-toggle-fix.js" defer></script>
        <script src="/home-hero-polish.js" defer></script>
      </body>
    </html>
  )
}
