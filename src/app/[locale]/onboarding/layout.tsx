import { Suspense } from "react"

import { LanguageSwitcher } from "@/components/LanguageSwitcher"
import { ThemeToggle } from "@/components/ThemeToggle"
import { OnboardingContent } from "./_components/OnboardingContent"
import { DecorativePanel, MobileHeroBanner } from "./_components/DecorativePanel"

/**
 * Onboarding layout — split-panel editorial design.
 * Desktop: decorative side panel (45%) + form panel (55%).
 * Mobile: condensed hero banner + form.
 */
export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-background transition-colors duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]">
      {/* Decorative side panel — desktop only */}
      <aside className="hidden lg:block lg:w-[42%] xl:w-[45%] lg:sticky lg:top-0 lg:h-screen">
        <Suspense fallback={<div className="h-full bg-foreground" />}>
          <DecorativePanel />
        </Suspense>
      </aside>

      {/* Main form panel */}
      <div className="flex-1 flex flex-col min-h-screen">
        <header className="flex items-center justify-between px-6 py-5 lg:px-10 lg:py-6">
          {/* Logo on mobile, hidden on desktop (shown in panel) */}
          <span className="font-serif text-xl tracking-tight text-heading transition-colors duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] lg:opacity-0 lg:pointer-events-none">
            Internex<span className="text-primary">.</span>io
          </span>
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <ThemeToggle />
          </div>
        </header>

        <main className="flex-1 flex items-start lg:items-center justify-center px-6 pb-12 pt-2 lg:px-10 lg:pt-0">
          <div className="w-full max-w-[560px]">
            {/* Mobile hero banner */}
            <div className="lg:hidden">
              <Suspense fallback={null}>
                <MobileHeroBanner />
              </Suspense>
            </div>

            <Suspense fallback={<div className="h-96 bg-muted/20 rounded-lg animate-pulse" />}>
              <OnboardingContent>{children}</OnboardingContent>
            </Suspense>
          </div>
        </main>
      </div>
    </div>
  )
}
