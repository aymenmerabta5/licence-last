"use client"

import { AlertCircle } from "lucide-react"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="en">
      <head>
        <style>{`
          :root { --bg: #faf6f1; --fg: #1a1a1a; --muted: #6b6b6b; --primary: #e8734a; }
          body { margin: 0; font-family: system-ui, sans-serif; background: var(--bg); color: var(--fg);
                 display: flex; align-items: center; justify-content: center; min-height: 100vh; }
          .container { text-align: center; max-width: 420px; padding: 2rem; }
          h1 { font-size: 1.5rem; margin: 1rem 0 0.5rem; }
          .digest { font-size: 0.8rem; color: var(--muted); font-family: monospace; margin-bottom: 1.5rem; }
          .actions { display: flex; gap: 0.75rem; justify-content: center; flex-wrap: wrap; }
          button, a { padding: 0.6rem 1.25rem; border-radius: 0.5rem; font-size: 0.9rem;
                      cursor: pointer; text-decoration: none; font-weight: 500; }
          button { background: var(--primary); color: white; border: none; }
          button:hover { opacity: 0.9; }
          a { border: 1px solid var(--fg); color: var(--fg); }
          a:hover { background: var(--fg); color: var(--bg); }
        `}</style>
      </head>
      <body>
        <div className="container">
          <AlertCircle size={48} color="#e8734a" />
          <h1>Something went wrong</h1>
          {error.digest && <p className="digest">Error ID: {error.digest}</p>}
          <div className="actions">
            <button type="button" onClick={reset}>
              Try again
            </button>
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- Root error boundary: Next.js router may be broken, must use plain <a> */}
            <a href="/">Return home</a>
          </div>
        </div>
      </body>
    </html>
  )
}
