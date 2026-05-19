"use client"

import { Globe, Languages } from "lucide-react"
import * as motion from "motion/react-client"
import { useTranslations } from "next-intl"
import type { StudentLanguage } from "@/app/[locale]/(authenticated)/dashboard/profile/_components/ProfileContent/types"
import { Badge } from "@/components/ui/badge"
import { Link } from "@/i18n/routing"
import { ease, reveal } from "@/lib/animations"

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

const proficiencyWidths: Record<string, string> = {
  a1: "20%",
  a2: "40%",
  b1: "60%",
  b2: "70%",
  c1: "85%",
  c2: "100%",
  native: "100%",
}

const proficiencyColors: Record<string, string> = {
  a1: "bg-muted-foreground/30",
  a2: "bg-muted-foreground/40",
  b1: "bg-primary/40",
  b2: "bg-primary/60",
  c1: "bg-primary/80",
  c2: "bg-primary",
  native: "bg-primary",
}

export function LanguagesCard({
  languages,
  canEdit,
  labels,
}: LanguagesCardProps) {
  const tProficiency = useTranslations("onboarding.student.proficiencyLevels")
  const hasLanguages = languages.length > 0

  return (
    <motion.section
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.45, duration: 0.6, ease }}
      className="border border-border/50 bg-card overflow-hidden"
    >
      {hasLanguages ? (
        <>
          <div className="px-5 py-4 border-b border-border/20 bg-muted/30 flex items-center gap-2.5">
            <Globe className="h-4 w-4 text-primary" />
            <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-foreground">
              {labels.languages}
            </h2>
          </div>

          <div className="p-5 space-y-3">
            {languages.map((lang, idx) => {
              const width = proficiencyWidths[lang.proficiency] || "50%"
              const color =
                proficiencyColors[lang.proficiency] || "bg-primary/50"

              return (
                <motion.div
                  key={`${lang.languageCode}-${idx}`}
                  {...reveal}
                  transition={{ delay: 0.55 + idx * 0.08 }}
                  className="space-y-2 p-3 border border-border/20 bg-muted/20"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-7 w-7 items-center justify-center rounded-sm bg-card border border-border/30 text-[10px] font-bold uppercase text-muted-foreground">
                        {lang.languageCode}
                      </div>
                      <span className="text-sm font-medium text-foreground">
                        {new Intl.DisplayNames([lang.languageCode], {
                          type: "language",
                        }).of(lang.languageCode)}
                      </span>
                    </div>
                    <Badge
                      variant="secondary"
                      className="bg-card text-foreground border border-border/30 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-sm"
                    >
                      {tProficiency(lang.proficiency as "a1")}
                    </Badge>
                  </div>

                  <div className="h-1.5 w-full bg-muted rounded-sm overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width }}
                      transition={{
                        duration: 0.8,
                        delay: 0.7 + idx * 0.12,
                        ease: "circOut",
                      }}
                      className={`h-full ${color} rounded-sm`}
                    />
                  </div>
                </motion.div>
              )
            })}

            {canEdit && (
              <div className="pt-1">
                <Link href="/dashboard/settings">
                  <button
                    type="button"
                    className="text-[11px] font-bold uppercase tracking-[0.15em] text-muted-foreground hover:text-primary transition-colors"
                  >
                    + {labels.addLanguages}
                  </button>
                </Link>
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="p-8">
          <div className="text-center space-y-4">
            <Languages className="h-8 w-8 mx-auto text-muted-foreground/30" />
            <p className="text-[11px] text-muted-foreground font-bold uppercase tracking-[0.2em]">
              {labels.noLanguagesListed}
            </p>
          </div>
        </div>
      )}
    </motion.section>
  )
}
