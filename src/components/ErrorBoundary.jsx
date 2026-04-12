import React from 'react'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ error, errorInfo })
    console.error('Error caught by boundary:', error, errorInfo)
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null })
    window.location.reload()
  }

  handleHome = () => {
    window.location.href = '/'
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-slate-950">
          <div className="bg-slate-900/90 backdrop-blur border border-slate-800 rounded-3xl p-8 max-w-lg text-center">
            <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-6">
              <span className="text-red-500 text-4xl font-bold">!</span>
            </div>
            
            <h1 className="text-2xl font-bold mb-3 text-white">Something went wrong</h1>
            <p className="text-slate-400 mb-6">
              We encountered an unexpected error. Don't worry, your data is safe.
            </p>

            {this.state.error && (
              <div className="text-left mb-6 p-4 rounded-xl bg-slate-950 overflow-auto max-h-40">
                <p className="text-xs text-red-400 font-mono">{this.state.error.toString()}</p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={this.handleRetry}
                className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-amber-500 text-slate-950 font-semibold hover:bg-amber-400 transition-all"
              >
                Try Again
              </button>
              <button
                onClick={this.handleHome}
                className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-slate-700 text-white hover:bg-slate-800 transition-colors"
              >
                Go Home
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
