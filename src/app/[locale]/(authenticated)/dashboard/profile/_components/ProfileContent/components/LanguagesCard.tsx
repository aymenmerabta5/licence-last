"use client"

import { Globe, Languages } from "lucide-react"
import * as motion from "motion/react-client"
import { useTranslations } from "next-intl"
import type { StudentLanguage } from "@/app/[locale]/(authenticated)/dashboard/profile/_components/ProfileContent/types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Link } from "@/i18n/routing"
import { ease } from "@/lib/animations"

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
  const t = useTranslations("dashboard.student.profile")
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
        <div className="relative rounded-[2.5rem] border border-slate-100 bg-white shadow-[0_20px_50px_rgba(0,0,0,0.03)] overflow-hidden transition-all duration-500 hover:shadow-[0_30px_70px_rgba(0,0,0,0.06)]">
          <div className="px-8 py-7 border-b border-slate-50 bg-slate-50/30 flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/5">
              <Globe className="h-5 w-5 text-primary" />
            </div>
            <h2 className="text-[11px] font-black uppercase tracking-[0.25em] text-slate-800">
              {labels.languages}
            </h2>
          </div>

          <div className="p-8 space-y-5">
            {languages.map((lang, idx) => (
              <motion.div
                key={lang.languageCode}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + idx * 0.1 }}
                className="flex items-center justify-between p-4 rounded-3xl bg-slate-50 border border-slate-100 group/item hover:bg-white hover:border-primary/20 transition-all duration-300"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white border border-slate-200 text-xs font-black uppercase text-slate-400 group-hover/item:text-primary transition-colors">
                    {lang.languageCode}
                  </div>
                  <span className="text-[14px] font-bold text-slate-700">
                    {new Intl.DisplayNames([lang.languageCode], { type: "language" }).of(lang.languageCode)}
                  </span>
                </div>
                <Badge variant="secondary" className="bg-white text-primary border-slate-200 text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full">
                  {tProficiency(lang.proficiency as "a1")}
                </Badge>
              </motion.div>
            ))}

            {canEdit && (
              <div className="pt-4">
                <Link href="/dashboard/settings">
                  <button className="text-[11px] font-black uppercase tracking-[0.25em] text-slate-400 hover:text-primary transition-colors">
                    + {labels.addLanguages}
                  </button>
                </Link>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="rounded-[2.5rem] border-2 border-dashed border-slate-100 p-12 bg-white/50">
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
