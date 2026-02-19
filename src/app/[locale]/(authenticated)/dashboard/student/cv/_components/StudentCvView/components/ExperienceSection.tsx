"use client"

import { Plus } from "lucide-react"
import { useState } from "react"
import { ExperienceEditor } from "@/app/[locale]/(authenticated)/dashboard/student/cv/_components/StudentCvView/components/experience/ExperienceEditor"
import { ExperienceListItem } from "@/app/[locale]/(authenticated)/dashboard/student/cv/_components/StudentCvView/components/experience/ExperienceListItem"
import type {
  ExperienceDraft,
  ExperienceSectionProps,
} from "@/app/[locale]/(authenticated)/dashboard/student/cv/_components/StudentCvView/components/experience/types"
import {
  EMPTY_EXPERIENCE_DRAFT,
  toInputDate,
} from "@/app/[locale]/(authenticated)/dashboard/student/cv/_components/StudentCvView/components/experience/utils"
import type { StudentCvExperience } from "@/app/[locale]/(authenticated)/dashboard/student/cv/_components/StudentCvView/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function ExperienceSection({
  experiences,
  creating,
  updating,
  deleting,
  onCreate,
  onUpdate,
  onDelete,
}: ExperienceSectionProps) {
  const [adding, setAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [draft, setDraft] = useState<ExperienceDraft>(EMPTY_EXPERIENCE_DRAFT)
  const editing = experiences.find((item) => item.id === editingId) ?? null

  function reset() {
    setDraft(EMPTY_EXPERIENCE_DRAFT)
    setAdding(false)
    setEditingId(null)
  }

  function handleStartAdding() {
    setAdding((current) => !current)
    setEditingId(null)
    setDraft(EMPTY_EXPERIENCE_DRAFT)
  }

  function handleStartEditing(experience: StudentCvExperience) {
    setEditingId(experience.id)
    setDraft({
      title: experience.title,
      organization: experience.organization,
      description: experience.description ?? "",
      startDate: toInputDate(experience.startDate),
      endDate: toInputDate(experience.endDate),
      isCurrent: experience.isCurrent,
    })
  }

  return (
    <Card className="border-border/40 rounded-3xl">
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <CardTitle className="font-serif text-xl">Experience</CardTitle>
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
          <ExperienceEditor
            mode="create"
            draft={draft}
            setDraft={setDraft}
            isPending={creating}
            onSubmit={() => {
              void onCreate({
                title: draft.title,
                organization: draft.organization,
                description: draft.description || undefined,
                startDate: draft.startDate,
                endDate: draft.endDate || undefined,
                isCurrent: draft.isCurrent,
              }).then(() => {
                reset()
              })
            }}
            onCancel={() => setAdding(false)}
          />
        )}

        {experiences.length === 0 && !adding && (
          <p className="text-sm text-muted-foreground">
            No experience entries yet.
          </p>
        )}

        {experiences.map((item) => {
          const isEditing = editing?.id === item.id

          if (isEditing) {
            return (
              <ExperienceEditor
                key={item.id}
                mode="edit"
                draft={draft}
                setDraft={setDraft}
                experience={editing}
                isPending={updating}
                onSubmit={() => {
                  void onUpdate({
                    experienceId: item.id,
                    title: draft.title || undefined,
                    organization: draft.organization || undefined,
                    description: draft.description || undefined,
                    startDate: draft.startDate || undefined,
                    endDate: draft.isCurrent ? null : draft.endDate || null,
                    isCurrent: draft.isCurrent,
                  }).then(() => {
                    reset()
                  })
                }}
                onCancel={() => setEditingId(null)}
              />
            )
          }

          return (
            <ExperienceListItem
              key={item.id}
              experience={item}
              deleting={deleting}
              onEdit={handleStartEditing}
              onDelete={(experienceId) => {
                void onDelete(experienceId)
              }}
            />
          )
        })}
      </CardContent>
    </Card>
  )
}
