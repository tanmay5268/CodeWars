"use client";

import * as React from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const details = error?.digest
    ? `Digest: ${error.digest}`
    : "A server component error occurred.";

  return (
    <html lang="en">
      <body
        style={{
          fontFamily:
            "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, Apple Color Emoji, Segoe UI Emoji",
          padding: 24,
        }}
      >
        <h1 style={{ marginBottom: 12 }}>Something went wrong</h1>
        <p style={{ marginBottom: 16, opacity: 0.8 }}>
          An unexpected error occurred. You can try again.
        </p>

        <pre
          style={{
            whiteSpace: "pre-wrap",
            background: "rgba(0,0,0,0.06)",
            padding: 12,
            borderRadius: 8,
            marginBottom: 16,
          }}
        >
          {details}
        </pre>

        <button
          type="button"
          onClick={() => reset()}
          style={{
            padding: "10px 14px",
            borderRadius: 8,
            border: "1px solid rgba(0,0,0,0.2)",
            background: "white",
            cursor: "pointer",
          }}
        >
          Try again
        </button>
      </body>
    </html>
  );
}
