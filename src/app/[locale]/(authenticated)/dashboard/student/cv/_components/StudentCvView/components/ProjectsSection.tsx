"use client"

import { useState } from "react"
import { Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

import { ProjectEditor } from "@/app/[locale]/(authenticated)/dashboard/student/cv/_components/StudentCvView/components/projects/ProjectEditor"
import { ProjectListItem } from "@/app/[locale]/(authenticated)/dashboard/student/cv/_components/StudentCvView/components/projects/ProjectListItem"
import type {
  ProjectDraft,
  ProjectsSectionProps,
} from "@/app/[locale]/(authenticated)/dashboard/student/cv/_components/StudentCvView/components/projects/types"
import {
  EMPTY_PROJECT_DRAFT,
  toInputDate,
} from "@/app/[locale]/(authenticated)/dashboard/student/cv/_components/StudentCvView/components/projects/utils"
import type { StudentCvProject } from "@/app/[locale]/(authenticated)/dashboard/student/cv/_components/StudentCvView/types"

export function ProjectsSection({
  projects,
  creating,
  updating,
  deleting,
  onCreate,
  onUpdate,
  onDelete,
}: ProjectsSectionProps) {
  const [adding, setAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [draft, setDraft] = useState<ProjectDraft>(EMPTY_PROJECT_DRAFT)

  function reset() {
    setDraft(EMPTY_PROJECT_DRAFT)
    setAdding(false)
    setEditingId(null)
  }

  function handleStartAdding() {
    setAdding((current) => !current)
    setEditingId(null)
    setDraft(EMPTY_PROJECT_DRAFT)
  }

  function handleStartEditing(project: StudentCvProject) {
    setEditingId(project.id)
    setDraft({
      name: project.name,
      summary: project.summary,
      projectUrl: project.projectUrl ?? "",
      repositoryUrl: project.repositoryUrl ?? "",
      startDate: toInputDate(project.startDate),
      endDate: toInputDate(project.endDate),
    })
  }

  return (
    <Card className="border-border/40 rounded-3xl">
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <CardTitle className="font-serif text-xl">Projects</CardTitle>
        <Button
          type="button"
          size="sm"
          variant="editorial-outline"
          className="gap-1.5"
          onClick={handleStartAdding}
        >
          <Plus className="h-3.5 w-3.5" />
          Add
        </Button>
      </CardHeader>

      <CardContent className="space-y-4">
        {adding && (
          <ProjectEditor
            mode="create"
            draft={draft}
            setDraft={setDraft}
            isPending={creating}
            onSubmit={() => {
              void onCreate({
                name: draft.name,
                summary: draft.summary,
                projectUrl: draft.projectUrl || undefined,
                repositoryUrl: draft.repositoryUrl || undefined,
                startDate: draft.startDate || undefined,
                endDate: draft.endDate || undefined,
              }).then(() => {
                reset()
              })
            }}
            onCancel={() => setAdding(false)}
          />
        )}

        {projects.length === 0 && !adding && (
          <p className="text-sm text-muted-foreground">No projects added yet.</p>
        )}

        {projects.map((project) => {
          const isEditing = editingId === project.id

          if (isEditing) {
            return (
              <ProjectEditor
                key={project.id}
                mode="edit"
                draft={draft}
                setDraft={setDraft}
                project={project}
                isPending={updating}
                onSubmit={() => {
                  void onUpdate({
                    projectId: project.id,
                    name: draft.name || undefined,
                    summary: draft.summary || undefined,
                    projectUrl: draft.projectUrl || null,
                    repositoryUrl: draft.repositoryUrl || null,
                    startDate: draft.startDate || null,
                    endDate: draft.endDate || null,
                  }).then(() => {
                    reset()
                  })
                }}
                onCancel={() => setEditingId(null)}
              />
            )
          }

          return (
            <ProjectListItem
              key={project.id}
              project={project}
              deleting={deleting}
              onEdit={handleStartEditing}
              onDelete={(projectId) => {
                void onDelete(projectId)
              }}
            />
          )
        })}
      </CardContent>
    </Card>
  )
}
