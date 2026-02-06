import type { Metadata } from "next"
import { DM_Sans, DM_Serif_Display } from "next/font/google"
import { ThemeProvider } from "next-themes"
import "./globals.css"

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

export const metadata: Metadata = {
  title: "Stag.io — The Future of Internship Discovery",
  description:
    "A centralized platform bridging the gap between universities and enterprises. Skill-based matching, automated document generation, and placement tracking.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${dmSans.variable} ${dmSerif.variable} font-sans antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
