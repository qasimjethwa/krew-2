"use client";

import { useEffect } from "react";

/** Last-resort boundary (replaces the root layout), so it uses inline styles only. */
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: "system-ui, sans-serif", background: "#000", color: "#fff" }}>
        <main style={{ minHeight: "100dvh", display: "grid", placeItems: "center", padding: 24, textAlign: "center" }}>
          <div>
            <h1 style={{ fontSize: 32, margin: 0 }}>KREW is having a moment</h1>
            <p style={{ opacity: 0.7 }}>Something went wrong on our side. Please try again.</p>
            <button
              onClick={reset}
              style={{ marginTop: 16, background: "#a8f46a", color: "#000", border: 0, borderRadius: 12, padding: "12px 20px", fontWeight: 600, cursor: "pointer" }}
            >
              Try again
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}
