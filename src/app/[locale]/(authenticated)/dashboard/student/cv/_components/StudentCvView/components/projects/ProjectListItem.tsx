"use client"

import { Link2, Pencil, Trash2 } from "lucide-react"
import type { StudentCvProject } from "@/app/[locale]/(authenticated)/dashboard/student/cv/_components/StudentCvView/types"
import { Button } from "@/components/ui/button"

interface ProjectListItemProps {
  project: StudentCvProject
  deleting: boolean
  onEdit: (project: StudentCvProject) => void
  onDelete: (projectId: string) => void
}

export function ProjectListItem({
  project,
  deleting,
  onEdit,
  onDelete,
}: ProjectListItemProps) {
  return (
    <div className="border border-border/30 p-4 space-y-2">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h4 className="text-sm font-semibold text-heading">{project.name}</h4>
          <p className="text-xs text-muted-foreground line-clamp-2">
            {project.summary}
          </p>
        </div>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="h-7 w-7"
            onClick={() => onEdit(project)}
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="h-7 w-7 text-destructive"
            disabled={deleting}
            onClick={() => onDelete(project.id)}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
        {project.projectUrl && (
          <a
            href={project.projectUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 hover:text-primary"
          >
            <Link2 className="h-3.5 w-3.5" />
            Project
          </a>
        )}
        {project.repositoryUrl && (
          <a
            href={project.repositoryUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 hover:text-primary"
          >
            <Link2 className="h-3.5 w-3.5" />
            Repository
          </a>
        )}
      </div>
    </div>
  )
}
