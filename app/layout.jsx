import '../src/index.css'

export const metadata = {
  title: 'Life. — Knowledge. Finance. Life.',
  description: 'Life. is a free educational platform covering finance, psychology, philosophy, and the systems that shape everyday life.',
  appleWebApp: {
    capable: true,
    title: 'Life.',
    statusBarStyle: 'black-translucent'
  },
  robots: 'index,follow',
  openGraph: {
    title: 'Life. — Knowledge. Finance. Life.',
    description: 'Free educational platform covering finance, psychology, philosophy, and the systems that shape everyday life.',
    type: 'website'
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
