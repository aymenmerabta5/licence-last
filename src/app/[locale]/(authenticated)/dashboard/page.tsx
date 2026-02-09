import { getTranslations } from "next-intl/server"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { StudentDashboard } from "@/app/[locale]/(authenticated)/_components/StudentDashboard"
import { RecruiterDashboard } from "@/app/[locale]/(authenticated)/_components/RecruiterDashboard"
import { AdminDashboard } from "@/app/[locale]/(authenticated)/_components/AdminDashboard"

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  // ⚠️ PREVIEW MODE
  const user = session?.user || {
    name: "Preview User",
    email: "preview@example.com",
    role: "student",
  }
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
          {user.role === "recruiter" && "Manage your active internship offers and discover top student talent for your organization."}
          {user.role === "admin" && "Monitor platform growth, validate internship agreements, and access detailed placement analytics."}
        </p>
      </header>

      {/* ── Role-Specific Content ── */}
      {user.role === "student" && <StudentDashboard user={user} />}
      {user.role === "recruiter" && <RecruiterDashboard user={user} />}
      {(user.role === "admin" || user.role === "super_admin") && <AdminDashboard user={user} />}
    </div>
  )
}
