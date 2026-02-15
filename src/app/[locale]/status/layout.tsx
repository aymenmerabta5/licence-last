import { LanguageSwitcher } from "@/components/LanguageSwitcher"
import { ThemeToggle } from "@/components/ThemeToggle"
import { Link } from "@/i18n/routing"

import { StatusContent } from "./_components/StatusContent"

export default async function StatusLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col bg-background transition-colors duration-500 ease-in-out">
      {/* ── Top Bar ── */}
      <header className="flex items-center justify-between px-6 py-5 lg:px-10 lg:py-6">
        <Link href="/" className="font-serif text-xl tracking-tight text-heading transition-colors duration-500 ease-in-out">
          Internex<span className="text-primary">.</span>io
        </Link>

        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          <ThemeToggle />
        </div>
      </header>

      {/* ── Centered content with auth guard ── */}
      <main className="flex-1 flex items-center justify-center px-6 pb-12 lg:px-10">
        <div className="w-full max-w-3xl">
          <StatusContent>{children}</StatusContent>
        </div>
      </main>
    </div>
  )
}
