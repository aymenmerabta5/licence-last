import { getTranslations } from "next-intl/server"
import { requireRole } from "@/lib/auth-guards"
import { StudentDashboard } from "@/app/[locale]/(authenticated)/_components/StudentDashboard"
import { RecruiterDashboard } from "@/app/[locale]/(authenticated)/_components/RecruiterDashboard"
import { AdminDashboard } from "@/app/[locale]/(authenticated)/_components/AdminDashboard"

export default async function DashboardPage() {
  const user = await requireRole(["student", "company_admin", "admin", "super_admin"])
  const t = await getTranslations("dashboard")

  const greeting = t("welcome")

  return (
    <div className="max-w-7xl mx-auto space-y-10">
      {/* ── Page Header ── */}
      <header className="space-y-2">
        <h1 className="font-serif text-[clamp(2.5rem,5vw,3.5rem)] leading-none tracking-tight text-heading">
          {greeting} <span className="text-primary">{user.name?.split(" ")[0] || "User"}</span>
        </h1>
        <p className="text-muted-foreground text-sm font-light tracking-wide max-w-2xl">
          {user.role === "student" && "Your next career milestone is just a few clicks away. Explore new opportunities tailored to your skills."}
          {user.role === "company_admin" && "Manage your active internship offers and discover top student talent for your organization."}
          {user.role === "admin" && "Monitor platform growth, validate internship agreements, and access detailed placement analytics."}
        </p>
      </header>

      {/* ── Role-Specific Content ── */}
      {user.role === "student" && <StudentDashboard user={user} />}
      {user.role === "company_admin" && <RecruiterDashboard user={user} />}
      {(user.role === "admin" || user.role === "super_admin") && <AdminDashboard user={user} />}
    </div>
  )
}
