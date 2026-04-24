import React from 'react'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ error, errorInfo })
    console.error('Error caught by boundary:', error, errorInfo)
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null })
    if (typeof window !== 'undefined') window.location.reload()
  }

  handleHome = () => {
    if (typeof window !== 'undefined') window.location.href = '/'
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          role="alert"
          style={{
            minHeight: '100dvh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 'max(24px, calc(16px + var(--safe-top, 0px))) 20px max(24px, calc(16px + var(--safe-bottom, 0px)))',
            boxSizing: 'border-box',
            background:
              'radial-gradient(1200px 480px at 12% -10%, rgba(80, 200, 120, 0.08), transparent 62%), linear-gradient(180deg, var(--life-skin) 0%, rgba(5, 5, 5, 1) 100%)',
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: 560,
              textAlign: 'center',
              padding: 32,
              borderRadius: 24,
              border: '1px solid rgba(255, 255, 255, 0.08)',
              background: 'rgba(17, 17, 17, 0.94)',
              backdropFilter: 'blur(14px)',
              boxShadow: '0 24px 60px rgba(0, 0, 0, 0.36)',
              color: 'var(--life-ink)',
            }}
          >
            <div
              style={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                background: 'rgba(229, 72, 77, 0.14)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 24px',
              }}
            >
              <span style={{ color: 'var(--life-red)', fontSize: 40, fontWeight: 700 }}>!</span>
            </div>

            <h1 style={{ margin: '0 0 12px', fontSize: 32, fontWeight: 700 }}>
              Something went wrong
            </h1>
            <p style={{ margin: '0 0 24px', color: 'var(--life-muted)', lineHeight: 1.6 }}>
              We encountered an unexpected error. Don't worry, your data is safe.
            </p>

            {this.state.error && (
              <div
                style={{
                  textAlign: 'left',
                  marginBottom: 24,
                  padding: 16,
                  maxHeight: 160,
                  overflow: 'auto',
                  borderRadius: 16,
                  background: 'rgba(0, 0, 0, 0.32)',
                  border: '1px solid rgba(229, 72, 77, 0.18)',
                }}
              >
                <p
                  style={{
                    margin: 0,
                    color: 'rgba(229, 72, 77, 0.92)',
                    fontSize: 12,
                    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                  }}
                >
                  {this.state.error.toString()}
                </p>
              </div>
            )}

            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 12,
                justifyContent: 'center',
              }}
            >
              <button
                onClick={this.handleRetry}
                style={{
                  flex: '1 1 160px',
                  minWidth: 140,
                  minHeight: 48,
                  padding: '12px 24px',
                  borderRadius: 14,
                  border: 'none',
                  background: 'var(--life-green)',
                  color: 'var(--life-skin)',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Try Again
              </button>
              <button
                onClick={this.handleHome}
                style={{
                  flex: '1 1 160px',
                  minWidth: 140,
                  minHeight: 48,
                  padding: '12px 24px',
                  borderRadius: 14,
                  border: '1px solid rgba(255, 255, 255, 0.14)',
                  background: 'transparent',
                  color: 'var(--life-ink)',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
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
