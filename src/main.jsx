import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './ii-mobile-fixes.css'
import './ios-global.css'
import App from './App.jsx'
import ErrorBoundary from './components/ErrorBoundary'
import { ToastProvider } from './components/Toast'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <ToastProvider>
        <App />
      </ToastProvider>
    </ErrorBoundary>
  </StrictMode>,
)
