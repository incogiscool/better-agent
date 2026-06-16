"use client";

export default function GlobalError({
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  return (
    <html lang="en">
      <body style={{ fontFamily: "sans-serif", padding: "2rem" }}>
        <h2>Something went wrong</h2>
        <button onClick={unstable_retry}>Try again</button>
      </body>
    </html>
  );
}
