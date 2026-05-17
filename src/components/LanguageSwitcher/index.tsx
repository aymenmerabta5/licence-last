"use client"

import { Suspense } from "react"

import { LanguageSwitcherContent } from "@/components/LanguageSwitcher/components/LanguageSwitcherContent"
import { LanguageSwitcherFallback } from "@/components/LanguageSwitcher/components/LanguageSwitcherFallback"

export function LanguageSwitcher({ compact }: { compact?: boolean }) {
  return (
    <Suspense fallback={<LanguageSwitcherFallback compact={compact} />}>
      <LanguageSwitcherContent compact={compact} />
    </Suspense>
  )
}
