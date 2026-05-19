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

const categoryStyles: Record<string, string> = {
  frontend:
    "bg-amber-500/10 text-amber-700 border-amber-200/60 hover:bg-amber-500 hover:text-white",
  backend:
    "bg-emerald-500/10 text-emerald-700 border-emerald-200/60 hover:bg-emerald-500 hover:text-white",
  devops:
    "bg-sky-500/10 text-sky-700 border-sky-200/60 hover:bg-sky-500 hover:text-white",
  design:
    "bg-rose-500/10 text-rose-700 border-rose-200/60 hover:bg-rose-500 hover:text-white",
  mobile:
    "bg-violet-500/10 text-violet-700 border-violet-200/60 hover:bg-violet-500 hover:text-white",
  general:
    "bg-muted text-foreground border-border/40 hover:bg-foreground hover:text-background",
}

function getCategoryStyle(category: string) {
  const key = category.toLowerCase()
  for (const [prefix, style] of Object.entries(categoryStyles)) {
    if (key.includes(prefix)) return style
  }
  return categoryStyles.general
}

export function SkillsCard({ skills, canEdit, labels }: SkillsCardProps) {
  const t = useTranslations("dashboard.student.profile")
  const hasSkills = skills.length > 0
  const grouped = groupByCategory(skills, t("generalCategory"))

  return (
    <motion.section
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.35, duration: 0.6, ease }}
      className="border border-border/50 bg-card overflow-hidden"
    >
      {hasSkills ? (
        <>
          <div className="flex items-center justify-between px-5 py-4 border-b border-border/20 bg-muted/30">
            <div className="flex items-center gap-2.5">
              <Zap className="h-4 w-4 text-primary" />
              <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-foreground">
                {labels.skills}
              </h2>
            </div>
            <span className="text-[11px] font-bold text-primary uppercase tracking-wider">
              {skills.length}
            </span>
          </div>

          <div className="p-5 space-y-5">
            {grouped.map(([category, categorySkills]) => (
              <div key={category} className="space-y-2.5">
                {grouped.length > 1 && (
                  <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground">
                    {category}
                  </p>
                )}
                <div className="flex flex-wrap gap-2">
                  {categorySkills.map((skill) => {
                    const catStyle = getCategoryStyle(category)
                    return (
                      <Badge
                        key={skill.id}
                        variant="outline"
                        className={`${catStyle} text-[11px] font-medium rounded-md px-3 py-1 transition-colors cursor-default`}
                      >
                        {skill.name}
                      </Badge>
                    )
                  })}
                </div>
              </div>
            ))}

            {canEdit && (
              <div className="pt-3 border-t border-border/10">
                <Link href="/dashboard/settings">
                  <button
                    type="button"
                    className="text-[11px] font-bold uppercase tracking-[0.15em] text-muted-foreground hover:text-primary transition-colors"
                  >
                    + {t("addMoreSkills")}
                  </button>
                </Link>
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="p-8">
          {canEdit ? (
            <EmptyState
              icon={Award}
              message={labels.emptyMessage}
              buttonText={labels.addSkills}
            />
          ) : (
            <p className="text-[11px] text-muted-foreground font-bold uppercase tracking-[0.2em] text-center">
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
    <div className="text-center space-y-5">
      <div className="flex h-12 w-12 mx-auto items-center justify-center rounded-lg bg-muted border border-border/20">
        <Icon className="h-6 w-6 text-muted-foreground" />
      </div>
      <p className="text-sm text-muted-foreground">{message}</p>
      <Link href="/dashboard/settings">
        <Button
          size="sm"
          className="rounded-md text-xs font-bold uppercase tracking-[0.15em]"
        >
          {buttonText}
        </Button>
      </Link>
    </div>
  )
}
