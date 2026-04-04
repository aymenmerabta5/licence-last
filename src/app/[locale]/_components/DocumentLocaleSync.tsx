"use client"

import { useLayoutEffect } from "react"

interface DocumentLocaleSyncProps {
  locale: string
  direction: "ltr" | "rtl"
  isRTL: boolean
}

export function DocumentLocaleSync({
  locale,
  direction,
  isRTL,
}: DocumentLocaleSyncProps) {
  useLayoutEffect(() => {
    document.documentElement.lang = locale
    document.documentElement.dir = direction

    if (isRTL) {
      document.body.style.setProperty(
        "--font-sans",
        "var(--font-arabic), var(--font-dm-sans)",
      )
      document.body.style.setProperty(
        "--font-serif",
        "var(--font-arabic), var(--font-dm-serif)",
      )
      return
    }

    document.body.style.removeProperty("--font-sans")
    document.body.style.removeProperty("--font-serif")
  }, [direction, isRTL, locale])

  return null
}
