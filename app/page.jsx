'use client'

import dynamic from 'next/dynamic'
import ErrorBoundary from '../src/components/shell/ErrorBoundary'
import { ToastProvider } from '../src/components/shell/Toast'

const App = dynamic(() => import('../src/App.jsx'), { ssr: false })

export default function Home() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <App />
      </ToastProvider>
    </ErrorBoundary>
  )
}
