"use client"

import { Award } from "lucide-react"
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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.6, ease }}
    >
      {hasSkills ? (
        <div className="border border-border/60 bg-card/30 dark:bg-card/50 overflow-hidden">
          <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-border/40 bg-muted/20 dark:bg-muted/10">
            <Award className="h-4 w-4 text-primary" />
            <h2 className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
              {labels.skills}
            </h2>
          </div>
          <div className="p-5 space-y-5">
          {/* Skill count */}
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-wider [[dir=rtl]_&]:tracking-normal">
              {t("skillCount", { count: skills.length })}
            </span>
            {canEdit && (
              <Link href="/dashboard/settings">
                <button
                  type="button"
                  className="text-[10px] font-bold uppercase tracking-[0.15em] text-primary hover:text-primary/80 transition-colors [[dir=rtl]_&]:tracking-normal"
                >
                  + {t("addMoreSkills")}
                </button>
              </Link>
            )}
          </div>

          {/* Grouped skills */}
          {grouped.map(([category, categorySkills], groupIdx) => (
            <div key={category} className="space-y-2.5">
              {grouped.length > 1 && (
                <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground/30 [[dir=rtl]_&]:tracking-normal">
                  {category}
                </p>
              )}
              <div className="flex flex-wrap gap-2">
                {categorySkills.map((skill, skillIdx) => (
                  <motion.div
                    key={skill.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{
                      delay: 0.35 + groupIdx * 0.08 + skillIdx * 0.03,
                      duration: 0.3,
                      ease,
                    }}
                  >
                    <Badge
                      variant="secondary"
                      className="bg-primary/5 text-primary text-[10px] uppercase font-bold tracking-wider rounded-full px-3 py-1.5 border-none hover:bg-primary/10 transition-colors"
                    >
                      {skill.name}
                    </Badge>
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
          </div>
        </div>
      ) : (
        <div className="border border-dashed border-border/40 p-8">
          {canEdit ? (
            <EmptyState
              icon={Award}
              message={labels.emptyMessage}
              buttonText={labels.addSkills}
            />
          ) : (
            <p className="text-xs text-muted-foreground/40 font-medium text-center">
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
    <div className="text-center space-y-3">
      <div className="flex h-12 w-12 items-center justify-center border border-border/50 bg-muted/30">
        <Icon className="h-5 w-5 text-muted-foreground/40" />
      </div>
      <p className="text-xs text-muted-foreground/50 font-medium max-w-[200px] mx-auto leading-relaxed">
        {message}
      </p>
      <Link href="/dashboard/settings">
        <Button
          variant="editorial-outline"
          size="sm"
          className="border-border/40 hover:border-primary mt-1 h-8 px-4 text-xs"
        >
          {buttonText}
        </Button>
      </Link>
    </div>
  )
}
