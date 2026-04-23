"use client"

import { Award, Zap } from "lucide-react"
import * as motion from "motion/react-client"
import { useTranslations } from "next-intl"
import type { StudentSkill } from "@/app/[locale]/(authenticated)/dashboard/profile/_components/ProfileContent/types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Link } from "@/i18n/routing"
import { ease } from "@/lib/animations"

interface SkillsCardProps {
  skills: StudentSkill[]
  canEdit: boolean
  labels: {
    skills: string
    addSkills: string
    emptyMessage: string
  }
}

function groupByCategory(skills: StudentSkill[], fallbackCategory: string) {
  const groups: Record<string, StudentSkill[]> = {}
  for (const skill of skills) {
    const cat = skill.category || fallbackCategory
    if (!groups[cat]) groups[cat] = []
    groups[cat].push(skill)
  }
  return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b))
}

export function SkillsCard({ skills, canEdit, labels }: SkillsCardProps) {
  const t = useTranslations("dashboard.student.profile")
  const hasSkills = skills.length > 0
  const grouped = groupByCategory(skills, t("generalCategory"))

  return (
    <motion.section
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.4, duration: 0.8, ease }}
      className="relative group"
    >
      {hasSkills ? (
        <div className="relative rounded-[2.5rem] border border-slate-100 bg-white shadow-[0_20px_50px_rgba(0,0,0,0.03)] overflow-hidden transition-all duration-500 hover:shadow-[0_30px_70px_rgba(0,0,0,0.06)]">
          <div className="flex items-center justify-between px-8 py-7 border-b border-slate-50 bg-slate-50/30">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/5">
                <Zap className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-[11px] font-black uppercase tracking-[0.25em] text-slate-800">
                {labels.skills}
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-primary" />
              <span className="text-[11px] font-bold text-primary uppercase tracking-widest">
                {skills.length}
              </span>
            </div>
          </div>

          <div className="p-8 space-y-8">
            {grouped.map(([category, categorySkills], groupIdx) => (
              <div key={category} className="space-y-4">
                {grouped.length > 1 && (
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300">
                    {category}
                  </p>
                )}
                <div className="flex flex-wrap gap-3.5">
                  {categorySkills.map((skill, skillIdx) => {
                    return (
                      <motion.div
                        key={skill.id}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{
                          delay: 0.5 + groupIdx * 0.1 + skillIdx * 0.04,
                          duration: 0.4,
                          type: "spring",
                          stiffness: 200,
                        }}
                        whileHover={{ y: -3, scale: 1.05 }}
                      >
                        <Badge
                          variant="outline"
                          className="bg-slate-50 text-slate-700 border-slate-100 text-[11px] font-bold uppercase tracking-wide rounded-xl px-5 py-2.5 transition-all hover:bg-primary hover:text-white hover:border-primary hover:shadow-[0_8px_20px_rgba(var(--primary-rgb),0.2)]"
                        >
                          {skill.name}
                        </Badge>
                      </motion.div>
                    )
                  })}
                </div>
              </div>
            ))}

            {canEdit && (
              <div className="pt-6 border-t border-slate-50">
                <Link href="/dashboard/settings">
                  <button
                    type="button"
                    className="group/btn flex items-center gap-3 text-[11px] font-black uppercase tracking-[0.25em] text-slate-400 transition-all hover:text-primary hover:gap-5"
                  >
                    <span>+ {t("addMoreSkills")}</span>
                    <motion.span animate={{ x: [0, 5, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}>→</motion.span>
                  </button>
                </Link>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="rounded-[2.5rem] border-2 border-dashed border-slate-100 p-12 bg-white/50 backdrop-blur-sm">
          {canEdit ? (
            <EmptyState
              icon={Award}
              message={labels.emptyMessage}
              buttonText={labels.addSkills}
            />
          ) : (
            <p className="text-[11px] text-slate-300 font-black uppercase tracking-[0.25em] text-center">
              {t("noSkillsListed")}
            </p>
          )}
        </div>
      )}
    </motion.section>
  )
}

interface EmptyStateProps {
  icon: typeof Award
  message: string
  buttonText: string
}

export function EmptyState({
  icon: Icon,
  message,
  buttonText,
}: EmptyStateProps) {
  return (
    <div className="text-center space-y-8">
      <div className="flex h-24 w-24 mx-auto items-center justify-center rounded-[2.5rem] bg-slate-50 border border-slate-100 shadow-inner">
        <Icon className="h-12 w-12 text-slate-200" />
      </div>
      <p className="text-base text-slate-400 font-medium tracking-wide leading-relaxed">
        {message}
      </p>
      <Link href="/dashboard/settings" className="inline-block pt-4">
        <Button
          className="rounded-full h-14 px-10 text-[11px] font-black uppercase tracking-[0.25em] bg-primary shadow-[0_15px_40px_rgba(var(--primary-rgb),0.2)] transition-all hover:scale-105"
        >
          {buttonText}
        </Button>
      </Link>
    </div>
  )
}
