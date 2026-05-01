"use client"

import { Save, X } from "lucide-react"
import type { Dispatch, SetStateAction } from "react"

import type { ExperienceDraft } from "@/app/[locale]/(authenticated)/dashboard/student/cv/_components/StudentCvView/components/experience/types"
import type { StudentCvExperience } from "@/app/[locale]/(authenticated)/dashboard/student/cv/_components/StudentCvView/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

interface ExperienceEditorProps {
  mode: "create" | "edit"
  draft: ExperienceDraft
  setDraft: Dispatch<SetStateAction<ExperienceDraft>>
  experience?: StudentCvExperience | null
  isPending: boolean
  onSubmit: () => void
  onCancel: () => void
}

export function ExperienceEditor({
  mode,
  draft,
  setDraft,
  experience,
  isPending,
  onSubmit,
  onCancel,
}: ExperienceEditorProps) {
  if (mode === "edit" && !experience) return null

  const isCreateMode = mode === "create"
  const saveLabel = isCreateMode
    ? isPending
      ? "Saving..."
      : "Save"
    : isPending
      ? "Updating..."
      : "Update"
  const saveDisabled = isCreateMode
    ? isPending ||
      !draft.title.trim() ||
      !draft.organization.trim() ||
      !draft.startDate
    : isPending

  return (
    <div className="border-2 border-primary/10 bg-primary/[0.02] p-5 space-y-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Input
          placeholder="Role title"
          className="rounded-none border-2 border-foreground/10 bg-transparent text-sm placeholder:text-muted-foreground/40 focus-visible:border-primary/40 focus-visible:ring-0"
          value={isCreateMode ? draft.title : undefined}
          defaultValue={isCreateMode ? undefined : experience?.title}
          onChange={(event) =>
            setDraft((current) => ({ ...current, title: event.target.value }))
          }
        />
        <Input
          placeholder="Organization"
          className="rounded-none border-2 border-foreground/10 bg-transparent text-sm placeholder:text-muted-foreground/40 focus-visible:border-primary/40 focus-visible:ring-0"
          value={isCreateMode ? draft.organization : undefined}
          defaultValue={isCreateMode ? undefined : experience?.organization}
          onChange={(event) =>
            setDraft((current) => ({
              ...current,
              organization: event.target.value,
            }))
          }
        />
      </div>

      <Textarea
        placeholder="Description"
        className="rounded-none border-2 border-foreground/10 bg-transparent text-sm placeholder:text-muted-foreground/40 focus-visible:border-primary/40 focus-visible:ring-0 min-h-[80px] resize-y"
        value={isCreateMode ? draft.description : undefined}
        defaultValue={
          isCreateMode ? undefined : (experience?.description ?? "")
        }
        onChange={(event) =>
          setDraft((current) => ({
            ...current,
            description: event.target.value,
          }))
        }
      />

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
          disabled={draft.isCurrent}
        />
      </div>

      <label className="flex items-center gap-2 text-xs text-muted-foreground">
        <input
          type="checkbox"
          className="h-3.5 w-3.5 accent-primary"
          checked={isCreateMode ? draft.isCurrent : undefined}
          defaultChecked={isCreateMode ? undefined : experience?.isCurrent}
          onChange={(event) =>
            setDraft((current) =>
              isCreateMode
                ? {
                    ...current,
                    isCurrent: event.target.checked,
                    endDate: event.target.checked ? "" : current.endDate,
                  }
                : { ...current, isCurrent: event.target.checked },
            )
          }
        />
        Current position
      </label>

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
