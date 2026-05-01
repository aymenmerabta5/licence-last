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
    <div className="border-2 border-primary/10 bg-primary/[0.02] p-5 space-y-4">
      <Input
        placeholder="Project name"
        className="rounded-none border-2 border-foreground/10 bg-transparent text-sm placeholder:text-muted-foreground/40 focus-visible:border-primary/40 focus-visible:ring-0"
        value={isCreateMode ? draft.name : undefined}
        defaultValue={isCreateMode ? undefined : project?.name}
        onChange={(event) =>
          setDraft((current) => ({ ...current, name: event.target.value }))
        }
      />

      <Textarea
        placeholder="Project summary"
        className="rounded-none border-2 border-foreground/10 bg-transparent text-sm placeholder:text-muted-foreground/40 focus-visible:border-primary/40 focus-visible:ring-0 min-h-[80px] resize-y"
        value={isCreateMode ? draft.summary : undefined}
        defaultValue={isCreateMode ? undefined : project?.summary}
        onChange={(event) =>
          setDraft((current) => ({ ...current, summary: event.target.value }))
        }
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Input
          placeholder="Project URL"
          className="rounded-none border-2 border-foreground/10 bg-transparent text-sm placeholder:text-muted-foreground/40 focus-visible:border-primary/40 focus-visible:ring-0"
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
          className="rounded-none border-2 border-foreground/10 bg-transparent text-sm placeholder:text-muted-foreground/40 focus-visible:border-primary/40 focus-visible:ring-0"
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

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Input
          type="date"
          className="rounded-none border-2 border-foreground/10 bg-transparent text-sm focus-visible:border-primary/40 focus-visible:ring-0"
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
          className="rounded-none border-2 border-foreground/10 bg-transparent text-sm focus-visible:border-primary/40 focus-visible:ring-0"
          value={isCreateMode ? draft.endDate : undefined}
          defaultValue={isCreateMode ? undefined : draft.endDate}
          onChange={(event) =>
            setDraft((current) => ({ ...current, endDate: event.target.value }))
          }
        />
      </div>

      <div className="flex gap-2 pt-1">
        <Button
          type="button"
          size="sm"
          className="gap-1.5 rounded-none"
          disabled={saveDisabled}
          onClick={onSubmit}
        >
          <Save className="h-3.5 w-3.5" />
          {saveLabel}
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          className="rounded-none"
          onClick={onCancel}
        >
          {!isCreateMode && <X className="h-3.5 w-3.5" />}
          Cancel
        </Button>
      </div>
    </div>
  )
}
