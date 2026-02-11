import { Suspense } from "react"

import { LanguageSwitcher } from "@/components/LanguageSwitcher"
import { ThemeToggle } from "@/components/ThemeToggle"
import { OnboardingContent } from "./_components/OnboardingContent"

/**
 * Onboarding layout with cacheComponents support.
 * Uses Suspense boundary to handle dynamic auth checks.
 */
export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col bg-background transition-colors duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]">
      <header className="flex items-center justify-between px-6 py-5 lg:px-10 lg:py-6">
        <span className="font-serif text-xl tracking-tight text-heading transition-colors duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]">
          Internex<span className="text-primary">.</span>io
        </span>
        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          <ThemeToggle />
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-6 pb-12 lg:px-10">
        <div className="w-full max-w-[520px]">
          <Suspense fallback={<div className="h-96 bg-muted/20 rounded-lg animate-pulse" />}>
            <OnboardingContent>{children}</OnboardingContent>
          </Suspense>
        </div>
      </main>
    </div>
  )
}
