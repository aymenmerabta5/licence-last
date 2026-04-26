import "./globals.css"

import { DM_Sans, DM_Serif_Display, Noto_Sans_Arabic } from "next/font/google"
import type { ReactNode } from "react"

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-dm-sans",
  display: "swap",
})

const dmSerif = DM_Serif_Display({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-dm-serif",
  display: "swap",
})

const notoSansArabic = Noto_Sans_Arabic({
  subsets: ["arabic"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-arabic",
  display: "swap",
})

/**
 * Root layout must own <html>/<body> for Next.js runtime error handling.
 * Keep this shell static so cacheComponents prerendering can succeed.
 * Locale-specific providers and document syncing live under app/[locale]/layout.tsx.
 */
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <body
        className={`${dmSans.variable} ${dmSerif.variable} ${notoSansArabic.variable} font-sans antialiased`}
      >
        {children}
      </body>
    </html>
  )
}
