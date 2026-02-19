"use client"

import { Save, X } from "lucide-react"
import type { Dispatch, SetStateAction } from "react"
import type { ProjectDraft } from "@/app/[locale]/(authenticated)/dashboard/student/cv/_components/StudentCvView/components/projects/types"
import type { StudentCvProject } from "@/app/[locale]/(authenticated)/dashboard/student/cv/_components/StudentCvView/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

interface ProjectEditorProps {
  mode: "create" | "edit"
  draft: ProjectDraft
  setDraft: Dispatch<SetStateAction<ProjectDraft>>
  project?: StudentCvProject | null
  isPending: boolean
  onSubmit: () => void
  onCancel: () => void
}

export function ProjectEditor({
  mode,
  draft,
  setDraft,
  project,
  isPending,
  onSubmit,
  onCancel,
}: ProjectEditorProps) {
  if (mode === "edit" && !project) return null

  const isCreateMode = mode === "create"
  const saveDisabled = isCreateMode
    ? isPending || !draft.name.trim() || !draft.summary.trim()
    : isPending
  const saveLabel = isCreateMode
    ? isPending
      ? "Saving..."
      : "Save"
    : isPending
      ? "Updating..."
      : "Update"

  return (
    <div className="border border-border/30 p-4 space-y-3">
      <Input
        placeholder="Project name"
        value={isCreateMode ? draft.name : undefined}
        defaultValue={isCreateMode ? undefined : project?.name}
        onChange={(event) =>
          setDraft((current) => ({ ...current, name: event.target.value }))
        }
      />
      <Textarea
        placeholder="Project summary"
        value={isCreateMode ? draft.summary : undefined}
        defaultValue={isCreateMode ? undefined : project?.summary}
        onChange={(event) =>
          setDraft((current) => ({ ...current, summary: event.target.value }))
        }
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Input
          placeholder="Project URL"
          value={isCreateMode ? draft.projectUrl : undefined}
          defaultValue={isCreateMode ? undefined : (project?.projectUrl ?? "")}
          onChange={(event) =>
            setDraft((current) => ({
              ...current,
              projectUrl: event.target.value,
            }))
          }
        />
        <Input
          placeholder="Repository URL"
          value={isCreateMode ? draft.repositoryUrl : undefined}
          defaultValue={
            isCreateMode ? undefined : (project?.repositoryUrl ?? "")
          }
          onChange={(event) =>
            setDraft((current) => ({
              ...current,
              repositoryUrl: event.target.value,
            }))
          }
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Input
          type="date"
          value={isCreateMode ? draft.startDate : undefined}
          defaultValue={isCreateMode ? undefined : draft.startDate}
          onChange={(event) =>
            setDraft((current) => ({
              ...current,
              startDate: event.target.value,
            }))
          }
        />
        <Input
          type="date"
          value={isCreateMode ? draft.endDate : undefined}
          defaultValue={isCreateMode ? undefined : draft.endDate}
          onChange={(event) =>
            setDraft((current) => ({ ...current, endDate: event.target.value }))
          }
        />
      </div>
      <div className="flex gap-2">
        <Button
          type="button"
          size="sm"
          className="gap-1.5"
          disabled={saveDisabled}
          onClick={onSubmit}
        >
          <Save className="h-3.5 w-3.5" />
          {saveLabel}
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={onCancel}>
          {!isCreateMode && <X className="h-3.5 w-3.5" />}
          Cancel
        </Button>
      </div>
    </div>
  )
}
