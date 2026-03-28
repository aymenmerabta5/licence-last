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
      {languages.length > 0 ? (
        <div className="border border-border/60 bg-card/30 dark:bg-card/50 overflow-hidden">
          <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-border/40 bg-muted/20 dark:bg-muted/10">
            <Languages className="h-4 w-4 text-primary" />
            <h2 className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
              {labels.languages}
            </h2>
          </div>
          <div className="p-5">
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
        </div>
      ) : (
        <div className="border border-dashed border-border/40 p-8">
          {canEdit ? (
            <div className="text-center space-y-3">
              <div className="flex h-12 w-12 items-center justify-center border border-border/50 bg-muted/30">
                <Languages className="h-5 w-5 text-muted-foreground/40" />
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
