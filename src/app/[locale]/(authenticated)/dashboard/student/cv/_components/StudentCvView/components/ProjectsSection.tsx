"use client"

import { FolderGit, Plus } from "lucide-react"
import * as motion from "motion/react-client"
import { useTranslations } from "next-intl"
import { useState } from "react"

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
import { Button } from "@/components/ui/button"
import { ease, reveal } from "@/lib/animations"

export function ProjectsSection({
  projects,
  creating,
  updating,
  deleting,
  onCreate,
  onUpdate,
  onDelete,
}: ProjectsSectionProps) {
  const t = useTranslations("dashboard.student.cv")
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
    <motion.section
      {...reveal}
      transition={{ duration: 0.6, ease, delay: 0.3 }}
      className="border border-border/50"
    >
      <div className="flex items-center justify-between gap-4 border-b border-border/50 px-6 py-4">
        <div className="flex items-center gap-3">
          <FolderGit className="h-4 w-4 text-primary" />
          <h2 className="font-serif text-xl text-heading">{t("projects")}</h2>
          {projects.length > 0 && (
            <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
              {t("projectsCount", { count: projects.length })}
            </span>
          )}
        </div>
        <Button
          type="button"
          size="editorial-sm"
          variant="editorial-outline"
          className="gap-1.5"
          onClick={handleStartAdding}
        >
          <Plus className="h-3.5 w-3.5" />
          {t("add")}
        </Button>
      </div>

      <div className="px-6 py-6 space-y-4">
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
          <div className="flex flex-col items-center justify-center gap-3 py-8 text-center">
            <div className="flex h-12 w-12 items-center justify-center border border-dashed border-border/60">
              <FolderGit className="h-5 w-5 text-muted-foreground/40" />
            </div>
            <p className="text-sm text-muted-foreground">
              {t("noProjects")}
            </p>
          </div>
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
      </div>
    </motion.section>
  )
}
