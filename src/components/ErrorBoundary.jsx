import { Component } from "react";
import { C } from "../systems/theme";

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error("[Life.] Uncaught error:", error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: "100vh",
          background: C.skin,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "Georgia,serif",
          padding: 32,
        }}>
          <div style={{ textAlign: "center", maxWidth: 400 }}>
            <div style={{
              width: 70,
              height: 70,
              borderRadius: "20%",
              background: `linear-gradient(145deg,${C.green},#2d6e42)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 20px",
              boxShadow: "0 4px 16px rgba(74,140,92,0.3)",
            }}>
              <span style={{ color: "#fff", fontSize: 28, fontWeight: 800 }}>l.</span>
            </div>
            <h2 style={{ margin: "0 0 10px", fontSize: 22, fontWeight: 700, color: C.ink }}>
              Something went wrong
            </h2>
            <p style={{ margin: "0 0 24px", fontSize: 14, color: C.muted, lineHeight: 1.7, fontStyle: "italic" }}>
              An unexpected error occurred. Please refresh the page to continue.
            </p>
            <button
              onClick={() => window.location.reload()}
              style={{
                background: C.green,
                border: "none",
                borderRadius: 12,
                padding: "14px 32px",
                color: "#fff",
                fontSize: 15,
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: "Georgia,serif",
                boxShadow: "0 3px 14px rgba(74,140,92,0.32)",
              }}
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
