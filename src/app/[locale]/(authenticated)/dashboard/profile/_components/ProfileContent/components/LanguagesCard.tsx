"use client"

import { Languages } from "lucide-react"
import * as motion from "motion/react-client"
import { useLocale, useTranslations } from "next-intl"
import type { StudentLanguage } from "@/app/[locale]/(authenticated)/dashboard/profile/_components/ProfileContent/types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Link } from "@/i18n/routing"
import { ease } from "@/lib/animations"
import { getLanguageLabel, toSupportedLocale } from "@/lib/constants/languages"

interface LanguagesCardProps {
  languages: StudentLanguage[]
  canEdit: boolean
  labels: {
    languages: string
    addLanguages: string
    emptyMessage: string
    noLanguagesListed: string
  }
}

export function LanguagesCard({
  languages,
  canEdit,
  labels,
}: LanguagesCardProps) {
  const locale = useLocale()
  const tProficiency = useTranslations("onboarding.student.proficiencyLevels")
  const languageLocale = toSupportedLocale(locale)

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35, duration: 0.6, ease }}
    >
      <div className="flex items-center gap-2 mb-5">
        <div className="h-px flex-1 bg-border/30" />
        <div className="flex items-center gap-1.5 shrink-0">
          <Languages className="h-3 w-3 text-primary" />
          <h2 className="text-[9px] font-bold uppercase tracking-[0.3em] text-muted-foreground/50 [[dir=rtl]_&]:tracking-normal">
            {labels.languages}
          </h2>
        </div>
        <div className="h-px flex-1 bg-border/30" />
      </div>

      {languages.length > 0 ? (
        <div className="border border-border/40 p-5">
          <div className="flex flex-wrap gap-2">
            {languages.map((language) => (
              <Badge
                key={language.languageCode}
                variant="secondary"
                className="bg-secondary/30 text-foreground text-[10px] uppercase font-bold tracking-wider rounded-full px-3 py-1.5 border-none"
              >
                {getLanguageLabel(language.languageCode, languageLocale)} ·{" "}
                {tProficiency(language.proficiency as "a1")}
              </Badge>
            ))}
          </div>
        </div>
      ) : (
        <div className="border border-dashed border-border/30 p-8">
          {canEdit ? (
            <div className="text-center space-y-3">
              <div className="inline-flex items-center justify-center p-3 rounded-xl bg-primary/5">
                <Languages className="h-5 w-5 text-primary/30" />
              </div>
              <p className="text-xs text-muted-foreground/50 font-medium max-w-[200px] mx-auto leading-relaxed">
                {labels.emptyMessage}
              </p>
              <Link href="/dashboard/settings">
                <Button
                  variant="editorial-outline"
                  size="sm"
                  className="border-border/40 hover:border-primary mt-1 h-8 px-4 text-xs"
                >
                  {labels.addLanguages}
                </Button>
              </Link>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground/40 font-medium text-center">
              {labels.noLanguagesListed}
            </p>
          )}
        </div>
      )}
    </motion.section>
  )
}
