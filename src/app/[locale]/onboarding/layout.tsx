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
        <div
          className="pointer-events-none absolute inset-0 bg-linear-to-b from-primary/5 via-transparent to-transparent dark:from-primary/8"
          aria-hidden="true"
        />

        <header className="flex items-center justify-between px-6 py-5 lg:px-10 lg:py-6">
          {/* Mobile logo (desktop logo lives in panel) */}
          <span className="lg:hidden font-serif text-xl tracking-tight text-heading transition-colors duration-500 ease-in-out">
            Internex<span className="text-primary">.</span>io
          </span>

          <div className="hidden lg:block" />

          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <ThemeToggle />
          </div>
        </header>

        <div className="flex-1 flex items-start lg:items-center justify-center px-6 pb-12 pt-2 lg:px-10 lg:pt-0">
          <div className="w-full max-w-[620px] space-y-6">
            {/* Mobile hero banner */}
            <div className="lg:hidden">
              <Suspense fallback={null}>
                <MobileHeroBanner />
              </Suspense>
            </div>

            <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-card/80 p-6 shadow-sm backdrop-blur-sm transition-colors duration-500 dark:border-border/80 dark:bg-card/70 sm:p-8 lg:p-10">
              <div
                className="pointer-events-none absolute inset-0 bg-linear-to-b from-primary/6 via-transparent to-transparent dark:from-primary/10"
                aria-hidden="true"
              />
              <div className="relative">
                <Suspense
                  fallback={
                    <div className="h-96 rounded-2xl bg-muted/30 animate-pulse" />
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
