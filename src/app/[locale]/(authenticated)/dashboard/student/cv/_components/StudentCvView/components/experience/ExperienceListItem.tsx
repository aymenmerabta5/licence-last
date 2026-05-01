"use client"

import { Building2, Calendar, Pencil, Trash2 } from "lucide-react"

import type { StudentCvExperience } from "@/app/[locale]/(authenticated)/dashboard/student/cv/_components/StudentCvView/types"
import { Button } from "@/components/ui/button"

interface ExperienceListItemProps {
  experience: StudentCvExperience
  deleting: boolean
  onEdit: (experience: StudentCvExperience) => void
  onDelete: (experienceId: string) => void
}

export function ExperienceListItem({
  experience,
  deleting,
  onEdit,
  onDelete,
}: ExperienceListItemProps) {
  return (
    <div className="group border border-border/40 bg-background transition-colors hover:border-primary/25">
      <div className="flex items-start justify-between gap-4 p-4">
        <div className="min-w-0 flex-1 space-y-2">
          <div className="space-y-1">
            <h4 className="text-sm font-semibold text-heading">
              {experience.title}
            </h4>
            <p className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
              <Building2 className="h-3 w-3" />
              {experience.organization}
            </p>
          </div>

          <p className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.15em] text-primary [[dir=rtl]_&]:tracking-normal">
            <Calendar className="h-3 w-3" />
            {new Date(experience.startDate).toLocaleDateString()} —{" "}
            {experience.isCurrent
              ? "Present"
              : experience.endDate
                ? new Date(experience.endDate).toLocaleDateString()
                : "N/A"}
          </p>

          {experience.description && (
            <p className="text-sm leading-relaxed text-foreground/80">
              {experience.description}
            </p>
          )}
        </div>

        <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          <Button
            type="button"
            size="icon-sm"
            variant="ghost"
            className="rounded-none"
            onClick={() => onEdit(experience)}
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button
            type="button"
            size="icon-sm"
            variant="ghost"
            className="rounded-none text-destructive"
            disabled={deleting}
            onClick={() => onDelete(experience.id)}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  )
}
