"use client"

import { Pencil, Trash2 } from "lucide-react"
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
    <div className="border border-border/30 p-4 space-y-2">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h4 className="text-sm font-semibold text-heading">
            {experience.title}
          </h4>
          <p className="text-xs text-muted-foreground">
            {experience.organization}
          </p>
        </div>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="h-7 w-7"
            onClick={() => onEdit(experience)}
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="h-7 w-7 text-destructive"
            disabled={deleting}
            onClick={() => onDelete(experience.id)}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
      <p className="text-xs text-muted-foreground">
        {new Date(experience.startDate).toLocaleDateString()} -{" "}
        {experience.isCurrent
          ? "Present"
          : experience.endDate
            ? new Date(experience.endDate).toLocaleDateString()
            : "N/A"}
      </p>
      {experience.description && (
        <p className="text-sm text-foreground/80">{experience.description}</p>
      )}
    </div>
  )
}
