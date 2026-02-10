"use client"

import * as motion from "motion/react-client"
import { Award } from "lucide-react"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Link } from "@/i18n/routing"

import type { StudentSkill } from "../types"

interface SkillsCardProps {
  skills: StudentSkill[]
  canEdit: boolean
  labels: {
    skills: string
    addSkills: string
    emptyMessage: string
  }
}

export function SkillsCard({ skills, canEdit, labels }: SkillsCardProps) {
  const hasSkills = skills.length > 0

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="space-y-3"
    >
      <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground/50">
        {labels.skills}
      </h2>
      <Card className="bg-background border-border/40 rounded-2xl p-6 shadow-sm">
        {hasSkills ? (
          <div className="flex flex-wrap gap-2">
            {skills.map((skill) => (
              <Badge
                key={skill.id}
                variant="secondary"
                className="bg-primary/5 text-primary text-[10px] uppercase font-bold tracking-wider rounded-full px-3 py-1 border-none"
              >
                {skill.name}
              </Badge>
            ))}
          </div>
        ) : (
          canEdit ? (
            <EmptyState
              icon={Award}
              message={labels.emptyMessage}
              buttonText={labels.addSkills}
            />
          ) : (
            <p className="text-xs text-muted-foreground/60 font-medium leading-relaxed">
              No skills listed yet.
            </p>
          )
        )}
      </Card>
    </motion.section>
  )
}

interface EmptyStateProps {
  icon: typeof Award
  message: string
  buttonText: string
}

export function EmptyState({ icon: Icon, message, buttonText }: EmptyStateProps) {
  return (
    <div className="text-center py-6 space-y-3">
      <div className="inline-flex items-center justify-center p-3 rounded-xl bg-secondary/10">
        <Icon className="h-5 w-5 text-muted-foreground/40" />
      </div>
      <p className="text-xs text-muted-foreground/60 font-medium max-w-[200px] mx-auto leading-relaxed">
        {message}
      </p>
      <Link href="/dashboard/settings">
        <Button
          variant="editorial-outline"
          size="editorial-sm"
          className="rounded-xl border-border/40 hover:border-primary mt-2"
        >
          {buttonText}
        </Button>
      </Link>
    </div>
  )
}
