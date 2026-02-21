import { Suspense } from "react"
import {
  DecorativePanel,
  MobileHeroBanner,
} from "@/app/[locale]/onboarding/_components/DecorativePanel"
import { OnboardingContent } from "@/app/[locale]/onboarding/_components/OnboardingContent"
import { LanguageSwitcher } from "@/components/LanguageSwitcher"
import { ThemeToggle } from "@/components/ThemeToggle"

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
    <div className="min-h-screen flex flex-col lg:flex-row bg-background transition-colors duration-500 ease-in-out">
      {/* Decorative side panel — desktop only */}
      <aside className="hidden lg:block lg:w-[42%] xl:w-[38%] relative">
        <div className="sticky top-0 h-screen">
          <Suspense fallback={<div className="h-full bg-accent" />}>
            <DecorativePanel />
          </Suspense>
        </div>
      </aside>

      {/* Main form panel */}
      <main className="relative flex-1 min-h-screen flex flex-col">
        <header className="flex items-center justify-between px-6 py-5 lg:px-10 lg:py-6">
          {/* Mobile logo (desktop logo lives in panel) */}
          <span className="lg:hidden font-serif text-xl tracking-tight text-heading transition-colors duration-500 ease-in-out">
            Stag<span className="text-primary">.</span>io
          </span>

          <div className="hidden lg:block" />

          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <ThemeToggle />
          </div>
        </header>

        <div className="flex-1 flex items-start lg:items-center justify-center px-6 pb-12 pt-2 lg:px-10 lg:pt-0">
          <div className="w-full max-w-[680px] space-y-10">
            {/* Mobile hero banner */}
            <div className="lg:hidden">
              <Suspense fallback={null}>
                <MobileHeroBanner />
              </Suspense>
            </div>

            <div className="relative">
              {/* Editorial flourish */}
              <div
                className="hidden lg:block absolute -top-16 -left-16 text-muted-foreground/10 font-serif text-[180px] leading-none select-none pointer-events-none"
                aria-hidden="true"
              >
                &ldquo;
              </div>

              {/* The form area */}
              <div className="relative bg-transparent z-10">
                <Suspense
                  fallback={
                    <div className="h-[600px] w-full animate-pulse border-t-2 border-primary/20 bg-muted/5 mt-8" />
                  }
                >
                  <OnboardingContent>{children}</OnboardingContent>
                </Suspense>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
