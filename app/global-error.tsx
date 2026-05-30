"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
          background: "#0a0a0a",
          color: "#fafafa",
          fontFamily:
            "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
        }}
      >
        <div style={{ maxWidth: 420, textAlign: "center" }}>
          <div
            style={{
              fontSize: 11,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.55)",
              marginBottom: 16,
            }}
          >
            Fatal error
          </div>
          <h1
            style={{
              fontSize: 24,
              fontWeight: 500,
              letterSpacing: "-0.02em",
              margin: "0 0 12px",
            }}
          >
            Something went very wrong.
          </h1>
          <p
            style={{
              fontSize: 14,
              lineHeight: 1.6,
              color: "rgba(255,255,255,0.65)",
              margin: "0 0 20px",
            }}
          >
            The app failed to render. Refresh the page, or contact us if it
            keeps happening.
          </p>
          {error.digest && (
            <code
              style={{
                display: "block",
                fontSize: 11,
                color: "rgba(255,255,255,0.45)",
                marginBottom: 20,
              }}
            >
              ref: {error.digest}
            </code>
          )}
          <button
            type="button"
            onClick={reset}
            style={{
              padding: "8px 14px",
              border: "1px solid rgba(255,255,255,0.2)",
              background: "transparent",
              color: "#fafafa",
              cursor: "pointer",
              fontFamily: "inherit",
              fontSize: 13,
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
