import type { Metadata } from "next";
import "nextra-theme-docs/style.css";

export const metadata: Metadata = {
  title: "404 — BetterAgent Docs",
};

export default function GlobalNotFound() {
  return (
    <html lang="en">
      <body style={{ fontFamily: "sans-serif", padding: "2rem" }}>
        <h1>404 — Page Not Found</h1>
        <p>
          <a href="/">Return to docs</a>
        </p>
      </body>
    </html>
  );
}
