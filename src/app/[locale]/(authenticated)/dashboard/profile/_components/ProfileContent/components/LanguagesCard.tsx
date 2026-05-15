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
  a1: "bg-slate-300",
  a2: "bg-slate-400",
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
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.5, duration: 0.8, ease }}
      className="relative group"
    >
      {hasLanguages ? (
        <div className="relative rounded-[2rem] border border-slate-100 bg-white shadow-[0_20px_50px_rgba(0,0,0,0.03)] overflow-hidden transition-all duration-500 hover:shadow-[0_30px_70px_rgba(0,0,0,0.06)]">
          <div className="px-6 py-6 border-b border-slate-50 bg-slate-50/30 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/5">
              <Globe className="h-5 w-5 text-primary" />
            </div>
            <h2 className="text-[11px] font-black uppercase tracking-[0.25em] text-slate-800">
              {labels.languages}
            </h2>
          </div>

          <div className="p-6 space-y-4">
            {languages.map((lang, idx) => {
              const width = proficiencyWidths[lang.proficiency] || "50%"
              const color =
                proficiencyColors[lang.proficiency] || "bg-primary/50"

              return (
                <motion.div
                  key={`${lang.languageCode}-${idx}`}
                  {...reveal}
                  transition={{ delay: 0.6 + idx * 0.1 }}
                  className="space-y-3 p-4 rounded-2xl bg-slate-50 border border-slate-100 group/item hover:bg-white hover:border-primary/20 transition-all duration-300"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white border border-slate-200 text-[11px] font-black uppercase text-slate-500 group-hover/item:text-primary transition-colors">
                        {lang.languageCode}
                      </div>
                      <span className="text-[14px] font-bold text-slate-700">
                        {new Intl.DisplayNames([lang.languageCode], {
                          type: "language",
                        }).of(lang.languageCode)}
                      </span>
                    </div>
                    <Badge
                      variant="secondary"
                      className="bg-white text-primary border-slate-200 text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full"
                    >
                      {tProficiency(lang.proficiency as "a1")}
                    </Badge>
                  </div>

                  {/* Proficiency Bar */}
                  <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width }}
                      transition={{
                        duration: 1,
                        delay: 0.8 + idx * 0.15,
                        ease: "circOut",
                      }}
                      className={`h-full ${color} rounded-full`}
                    />
                  </div>
                </motion.div>
              )
            })}

            {canEdit && (
              <div className="pt-2">
                <Link href="/dashboard/settings">
                  <button
                    type="button"
                    className="text-[11px] font-black uppercase tracking-[0.25em] text-slate-400 hover:text-primary transition-colors"
                  >
                    + {labels.addLanguages}
                  </button>
                </Link>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="rounded-[2rem] border-2 border-dashed border-slate-100 p-12 bg-white/50">
          <div className="text-center space-y-6">
            <Languages className="h-10 w-10 mx-auto text-slate-200" />
            <p className="text-[11px] text-slate-300 font-black uppercase tracking-[0.25em]">
              {labels.noLanguagesListed}
            </p>
          </div>
        </div>
      )}
    </motion.section>
  )
}
