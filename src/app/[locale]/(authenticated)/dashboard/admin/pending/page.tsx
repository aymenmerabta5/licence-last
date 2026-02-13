import { getTranslations } from "next-intl/server"

import { Separator } from "@/components/ui/separator"
import { Card } from "@/components/ui/card"
import { localeRedirect } from "@/lib/navigation"
import { requireRole } from "@/lib/auth-guards"
import { getUniversityByUserId } from "@/server/services/universities/get"

export default async function AdminPendingPage() {
  const user = await requireRole(["university_admin"])

  if (!user.onboardingCompleted) {
    return localeRedirect("/onboarding/university")
  }

  const university = await getUniversityByUserId(user.id)

  if (university?.status === "approved") {
    return localeRedirect("/dashboard/admin")
  }

  if (university?.status === "rejected") {
    return localeRedirect("/dashboard/admin/rejected")
  }

  const t = await getTranslations("dashboard.admin.pending")

  return (
    <div className="max-w-3xl mx-auto space-y-10">
      <header className="space-y-3">
        <p className="text-[10px] uppercase tracking-[0.35em] font-bold text-primary [[dir=rtl]_&]:tracking-normal">
          {t("kicker")}
        </p>
        <h1 className="font-serif text-[clamp(2.25rem,4vw,3rem)] leading-tight tracking-tight text-heading">
          {t("title")}
        </h1>
        <p className="text-muted-foreground text-sm leading-relaxed font-light max-w-2xl">
          {t("subtitle")}
        </p>
      </header>

      <Separator className="bg-border/60" />

      <Card className="rounded-none border border-border/60 bg-background/40 p-6 shadow-none space-y-2">
        <p className="text-[10px] uppercase tracking-[0.2em] font-semibold text-muted-foreground [[dir=rtl]_&]:tracking-normal">
          {t("statusLabel")}
        </p>
        <p className="font-serif text-xl text-primary">{t("statusValue")}</p>
      </Card>

      <div className="space-y-4">
        <h3 className="font-serif text-lg text-heading">{t("whatNext")}</h3>
        <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground font-light">
          <li>{t("step1")}</li>
          <li>{t("step2")}</li>
          <li>{t("step3")}</li>
        </ol>
      </div>
    </div>
  )
}
