import { LanguageSwitcher } from "@/components/LanguageSwitcher"
import { ThemeToggle } from "@/components/ThemeToggle"
import { requireRole } from "@/lib/auth-guards"

export default async function OnboardingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requireRole(["company_admin"])

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
          {children}
        </div>
      </main>
    </div>
  )
}
