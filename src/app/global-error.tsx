"use client"

import { getRootFallbackSettings } from "@/lib/root-fallback-copy"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const { locale, direction, copy } = getRootFallbackSettings(
    typeof document === "undefined" ? undefined : document.documentElement.lang,
  )

  return (
    <html lang={locale} dir={direction} suppressHydrationWarning>
      <head>
        <style>{`
          :root {
            --bg: #faf6f1;
            --fg: #1a1a1a;
            --muted: #6b6b6b;
            --primary: #e8734a;
            --border: rgba(26,26,26,0.1);
          }
          body {
            margin: 0;
            font-family: Georgia, "Times New Roman", serif;
            background: var(--bg);
            color: var(--fg);
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
          }
          .container {
            text-align: center;
            max-width: 520px;
            padding: 2rem;
          }
          .edition {
            font-size: 10px;
            font-weight: 500;
            letter-spacing: 0.35em;
            text-transform: uppercase;
            color: var(--primary);
            margin-bottom: 2.5rem;
            display: block;
          }
          .dot-separator {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 1rem;
          }
          .dot-separator .line {
            height: 1px;
            background: rgba(26,26,26,0.15);
            width: 40px;
          }
          .dot-separator .dot {
            width: 6px;
            height: 6px;
            border-radius: 50%;
            background: var(--primary);
          }
          .icon-wrap {
            width: 96px;
            height: 96px;
            border-radius: 50%;
            background: rgba(232,115,74,0.1);
            display: inline-flex;
            align-items: center;
            justify-content: center;
            margin: 2.5rem 0 1.5rem;
          }
          .icon-wrap svg {
            width: 48px;
            height: 48px;
            color: var(--primary);
          }
          h1 {
            font-size: 1.75rem;
            margin: 0 0 0.75rem;
            line-height: 1.2;
            letter-spacing: -0.02em;
          }
          .divider {
            width: 100%;
            max-width: 320px;
            height: 1px;
            background: var(--border);
            margin: 0 auto 1.5rem;
          }
          p {
            font-size: 0.875rem;
            line-height: 1.625;
            color: var(--muted);
            margin: 0 0 2rem;
            font-weight: 300;
          }
          .digest {
            font-size: 0.8rem;
            color: var(--muted);
            font-family: monospace;
            margin-bottom: 1.5rem;
          }
          .actions {
            display: flex;
            gap: 0.75rem;
            justify-content: center;
            flex-wrap: wrap;
          }
          .btn {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.6rem 1.25rem;
            font-size: 0.75rem;
            font-weight: 700;
            letter-spacing: 0.15em;
            text-transform: uppercase;
            cursor: pointer;
            text-decoration: none;
            border: 2px solid var(--fg);
            background: transparent;
            color: var(--fg);
            transition: background 0.3s, color 0.3s;
          }
          .btn-primary {
            background: var(--fg);
            color: var(--bg);
            border-color: var(--fg);
          }
          .btn:hover {
            opacity: 0.85;
          }
        `}</style>
      </head>
      <body>
        <div className="container">
          <span className="edition">Error Edition</span>

          <div className="dot-separator" aria-hidden="true">
            <span className="line" />
            <span className="dot" />
            <span className="line" />
          </div>

          <div className="icon-wrap">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>

          <div className="dot-separator" aria-hidden="true">
            <span className="line" />
            <span className="dot" />
            <span className="line" />
          </div>

          <h1>{copy.title}</h1>
          <div className="divider" />

          {error.digest && (
            <p className="digest">
              {copy.errorId}: {error.digest}
            </p>
          )}

          <div className="actions">
            <button type="button" onClick={reset} className="btn btn-primary">
              {copy.retry}
            </button>
            <a href={`/${locale}`} className="btn">
              {copy.returnHome}
            </a>
          </div>
        </div>
      </body>
    </html>
  )
}
