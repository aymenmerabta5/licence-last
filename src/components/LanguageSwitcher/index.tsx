"use client"

import { Suspense } from "react"

import { LanguageSwitcherContent } from "@/components/LanguageSwitcher/components/LanguageSwitcherContent"
import { LanguageSwitcherFallback } from "@/components/LanguageSwitcher/components/LanguageSwitcherFallback"

export function LanguageSwitcher() {
  return (
    <Suspense fallback={<LanguageSwitcherFallback />}>
      <LanguageSwitcherContent />
    </Suspense>
  )
}
