import "./globals.css"

import type { ReactNode } from "react"

/**
 * Minimal root layout — delegates <html>/<body> to [locale]/layout.tsx
 * so that lang/dir attributes can be set from the locale param
 * without accessing dynamic headers (cacheComponents compatible).
 */
export default function RootLayout({ children }: { children: ReactNode }) {
  return children
}
