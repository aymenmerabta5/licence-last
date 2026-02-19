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
    <div className="border border-border/30 p-4 space-y-3">
      <Input
        placeholder="Role title"
        value={isCreateMode ? draft.title : undefined}
        defaultValue={isCreateMode ? undefined : experience?.title}
        onChange={(event) =>
          setDraft((current) => ({ ...current, title: event.target.value }))
        }
      />
      <Input
        placeholder="Organization"
        value={isCreateMode ? draft.organization : undefined}
        defaultValue={isCreateMode ? undefined : experience?.organization}
        onChange={(event) =>
          setDraft((current) => ({
            ...current,
            organization: event.target.value,
          }))
        }
      />
      <Textarea
        placeholder="Description"
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
          disabled={draft.isCurrent}
        />
      </div>
      <label className="flex items-center gap-2 text-xs text-muted-foreground">
        <input
          type="checkbox"
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
