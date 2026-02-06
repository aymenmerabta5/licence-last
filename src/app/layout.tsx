import "./globals.css"

import { DM_Sans, DM_Serif_Display, Noto_Sans_Arabic } from "next/font/google"
import { getLocale } from "next-intl/server"

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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const locale = await getLocale()
  const isRTL = locale === "ar"

  return (
    <html
      lang={locale}
      dir={isRTL ? "rtl" : "ltr"}
      suppressHydrationWarning
    >
      <body
        className={`${dmSans.variable} ${dmSerif.variable} ${notoSansArabic.variable} font-sans antialiased`}
      >
        {children}
      </body>
    </html>
  )
}
