import { getTranslations } from "next-intl/server"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { requireRole } from "@/lib/auth-guards"
import { localeRedirect } from "@/lib/navigation"
import { getUniversityStatusByUserId } from "@/server/services/universities/get-status"

export default async function UniversityRejectedPage() {
  const user = await requireRole(["university_admin"], {
    allowUnapproved: true,
  })
  const university = await getUniversityStatusByUserId(user.id)

  if (!university) {
    return localeRedirect("/onboarding/university")
  }

  if (university.status === "approved") {
    return localeRedirect("/dashboard/admin")
  }

  if (university.status !== "rejected") {
    return localeRedirect("/status/university/pending")
  }

  const t = await getTranslations("dashboard.admin.rejected")

  return (
    <div className="space-y-10">
      <header className="space-y-3">
        <p className="text-[10px] uppercase tracking-[0.35em] font-bold text-destructive [[dir=rtl]_&]:tracking-normal">
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

      <Card className="rounded-none border border-border/60 bg-background/40 p-6 shadow-none space-y-5">
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] font-semibold text-muted-foreground [[dir=rtl]_&]:tracking-normal">
            {t("reasonLabel")}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-foreground/80">
            {university.rejectionReason || "—"}
          </p>
        </div>
      </Card>

      <p className="text-sm text-muted-foreground font-light">
        {t("contactSupport")}
      </p>

      <Button
        variant="editorial-outline"
        size="editorial"
        nativeButton={false}
        render={<a href="mailto:support@internex.io" />}
      >
        {t("reapply")}
      </Button>
    </div>
  )
}
