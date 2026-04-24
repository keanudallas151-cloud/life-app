import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './ii-mobile-fixes.css'
import './ios-global.css'
import App from './App.jsx'
import ErrorBoundary from './components/shell/ErrorBoundary'
import { ToastProvider } from './components/shell/Toast'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <ToastProvider>
        <App />
      </ToastProvider>
    </ErrorBoundary>
  </StrictMode>,
)
