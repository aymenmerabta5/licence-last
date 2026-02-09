import { getTranslations } from "next-intl/server"

import { requireRole } from "@/lib/auth-guards"
import { AdminDashboard } from "@/app/[locale]/(authenticated)/_components/AdminDashboard"

export default async function AdminDashboardPage() {
  const user = await requireRole(["admin", "super_admin"])
  const t = await getTranslations("dashboard")
  const greeting = t("welcome")

  return (
    <div className="max-w-7xl mx-auto space-y-10">
      <header className="space-y-2">
        <h1 className="font-serif text-[clamp(2.5rem,5vw,3.5rem)] leading-none tracking-tight text-heading">
          {greeting}{" "}
          <span className="text-primary">
            {user.name?.split(" ")[0] || "User"}
          </span>
        </h1>
        <p className="text-muted-foreground text-sm font-light tracking-wide max-w-2xl">
          Monitor platform activity, validate internship agreements, and access
          placement analytics across the ecosystem.
        </p>
      </header>

      <AdminDashboard user={user} />
    </div>
  )
}

