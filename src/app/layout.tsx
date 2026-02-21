import "./globals.css"

import { Suspense, type ReactNode } from "react"

/**
 * Minimal root layout — delegates <html>/<body> to [locale]/layout.tsx
 * so that lang/dir attributes can be set from the locale param
 * without accessing dynamic headers (cacheComponents compatible).
 *
 * The Suspense boundary here is critical: [locale]/layout.tsx is async
 * (awaits params + getMessages). During locale transitions (e.g. en→ar),
 * React needs a parent Suspense boundary to handle the async re-render
 * of the locale layout without triggering the "cleaning up async info"
 * React bug.
 */
export default function RootLayout({ children }: { children: ReactNode }) {
  return <Suspense>{children}</Suspense>
}
