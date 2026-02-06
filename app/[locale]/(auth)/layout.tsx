import { LanguageSwitcher } from "@/components/LanguageSwitcher"
import { ThemeToggle } from "@/components/ThemeToggle"

import { AuthPanel } from "./_components/AuthPanel"

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-background ed-smooth">
      {/* ── Decorative Editorial Panel — Desktop only ── */}
      <aside className="hidden lg:block lg:w-[42%] xl:w-[38%] relative">
        <div className="sticky top-0 h-screen">
          <AuthPanel />
        </div>
      </aside>

      {/* ── Form Panel ── */}
      <main className="flex-1 min-h-screen flex flex-col">
        {/* Top Bar */}
        <header className="flex items-center justify-between px-6 py-5 lg:px-10 lg:py-6">
          {/* Mobile brand (hidden on desktop — panel has logo) */}
          <span className="lg:hidden font-serif text-xl tracking-tight text-heading ed-smooth">
            Internex<span className="text-primary">.</span>io
          </span>

          {/* Spacer for desktop alignment */}
          <div className="hidden lg:block" />

          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <ThemeToggle />
          </div>
        </header>

        {/* Centered form content */}
        <div className="flex-1 flex items-center justify-center px-6 pb-12 lg:px-10">
          <div className="w-full max-w-[420px]">
            {children}
          </div>
        </div>
      </main>
    </div>
  )
}
