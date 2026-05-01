"use client"

import { ExternalLink, FolderGit, Pencil, Trash2 } from "lucide-react"

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
    <div className="group border border-border/40 bg-background transition-colors hover:border-primary/25">
      <div className="flex items-start justify-between gap-4 p-4">
        <div className="min-w-0 flex-1 space-y-2">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <FolderGit className="h-3.5 w-3.5 text-primary shrink-0" />
              <h4 className="text-sm font-semibold text-heading">
                {project.name}
              </h4>
            </div>
            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
              {project.summary}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            {project.projectUrl && (
              <a
                href={project.projectUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 hover:text-primary transition-colors"
              >
                <ExternalLink className="h-3 w-3" />
                Project
              </a>
            )}
            {project.repositoryUrl && (
              <a
                href={project.repositoryUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 hover:text-primary transition-colors"
              >
                <ExternalLink className="h-3 w-3" />
                Repository
              </a>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          <Button
            type="button"
            size="icon-sm"
            variant="ghost"
            className="rounded-none"
            onClick={() => onEdit(project)}
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button
            type="button"
            size="icon-sm"
            variant="ghost"
            className="rounded-none text-destructive"
            disabled={deleting}
            onClick={() => onDelete(project.id)}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  )
}
