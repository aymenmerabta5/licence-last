"use client"

import { Loader2 } from "lucide-react"
import * as motion from "motion/react-client"
import { useTranslations } from "next-intl"
import { DomainManager } from "@/app/[locale]/(authenticated)/dashboard/university/profile/_components/UniversityProfileView/components/DomainManager"
import { UniversityProfileForm } from "@/app/[locale]/(authenticated)/dashboard/university/profile/_components/UniversityProfileView/components/UniversityProfileForm"
import { useUniversityProfile } from "@/app/[locale]/(authenticated)/dashboard/university/profile/_components/UniversityProfileView/hooks/useUniversityProfile"
import { Badge } from "@/components/ui/badge"
import { ease, reveal, revealWithDelay } from "@/lib/animations"

export function UniversityProfileView() {
  const t = useTranslations("dashboard.universityProfile")
  const {
    university,
    domains,
    isLoading,
    updateUniversity,
    isUpdating,
    addDomain,
    isAddingDomain,
    removeDomain,
    isRemovingDomain,
  } = useUniversityProfile()

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
        <span className="text-xs uppercase tracking-[0.1em] text-muted-foreground">
          {t("loading")}
        </span>
      </div>
    )
  }

  if (!university) {
    return (
      <div className="max-w-4xl mx-auto border border-dashed border-border/60 p-12 text-center space-y-4">
        <p className="font-serif text-lg text-heading">{t("notFound")}</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Editorial masthead */}
      <header className="space-y-4">
        <motion.div
          {...reveal}
          transition={{ duration: 0.6, ease }}
          className="h-0.5 bg-primary"
        />

        <motion.div
          {...reveal}
          transition={revealWithDelay(0.1)}
          className="space-y-3"
        >
          <Badge variant="editorial-muted">{t("kicker")}</Badge>
          <h1 className="font-serif text-[clamp(1.8rem,3.2vw,2.4rem)] leading-[1.1] tracking-tight text-heading">
            {university.name}
          </h1>
          <p className="text-sm font-light tracking-wide text-muted-foreground max-w-2xl">
            {t("description")}
          </p>
        </motion.div>
      </header>

      {/* Profile Form */}
      <motion.div
        {...reveal}
        transition={revealWithDelay(0.15)}
        className="border border-border/60 bg-card/30 dark:bg-card/50 overflow-hidden"
      >
        <div className="flex items-center gap-2.5 px-6 py-4 border-b border-border/40 bg-muted/20 dark:bg-muted/10">
          <h3 className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
            {t("profileTitle")}
          </h3>
        </div>
        <div className="p-6">
          <UniversityProfileForm
            university={university}
            onSubmit={updateUniversity}
            isUpdating={isUpdating}
          />
        </div>
      </motion.div>

      {/* Domain Manager */}
      <motion.div
        {...reveal}
        transition={revealWithDelay(0.2)}
        className="border border-border/60 bg-card/30 dark:bg-card/50 overflow-hidden"
      >
        <div className="flex items-center gap-2.5 px-6 py-4 border-b border-border/40 bg-muted/20 dark:bg-muted/10">
          <h3 className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
            {t("domainsTitle")}
          </h3>
        </div>
        <div className="p-6">
          <DomainManager
            domains={domains}
            onAdd={addDomain}
            onRemove={removeDomain}
            isAdding={isAddingDomain}
            isRemoving={isRemovingDomain}
          />
        </div>
      </motion.div>
    </div>
  )
}
