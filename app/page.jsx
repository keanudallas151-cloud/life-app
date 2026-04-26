'use client'

import dynamic from 'next/dynamic'
import ErrorBoundary from '../src/components/shell/ErrorBoundary'
import { ToastProvider } from '../src/components/shell/Toast'

// Inline loader shown while the main App bundle is fetched/parsed.
// Matches the app's dark background so the transition is seamless on mobile.
function AppLoader() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100dvh',
        background: '#0a0a0a',
        flexDirection: 'column',
        gap: 16,
      }}
    >
      <span
        style={{
          fontFamily: "Georgia, 'Times New Roman', serif",
          fontSize: 40,
          fontWeight: 700,
          color: '#50c878',
          letterSpacing: '-0.03em',
        }}
      >
        l.
      </span>
      <div
        style={{
          width: 32,
          height: 3,
          borderRadius: 999,
          background: 'rgba(255,255,255,0.08)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            height: '100%',
            borderRadius: 999,
            background: '#50c878',
            animation: 'life-load-bar 1.4s ease-in-out infinite',
          }}
        />
      </div>
    </div>
  )
}

const App = dynamic(() => import('../src/App.jsx'), {
  ssr: false,
  loading: () => <AppLoader />,
})

export default function Home() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <App />
      </ToastProvider>
    </ErrorBoundary>
  )
}
