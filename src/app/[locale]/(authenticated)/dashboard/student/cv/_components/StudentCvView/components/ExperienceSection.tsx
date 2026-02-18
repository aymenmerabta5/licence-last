"use client"

import { useMemo, useState } from "react"
import { Pencil, Plus, Save, Trash2, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

import type { StudentCvExperience } from "@/app/[locale]/(authenticated)/dashboard/student/cv/_components/StudentCvView/types"

interface ExperienceSectionProps {
  experiences: StudentCvExperience[]
  creating: boolean
  updating: boolean
  deleting: boolean
  onCreate: (input: {
    title: string
    organization: string
    description?: string
    startDate: string
    endDate?: string
    isCurrent?: boolean
  }) => Promise<void>
  onUpdate: (input: {
    experienceId: string
    title?: string
    organization?: string
    description?: string
    startDate?: string
    endDate?: string | null
    isCurrent?: boolean
  }) => Promise<void>
  onDelete: (experienceId: string) => Promise<void>
}

function toInputDate(value: Date | string | null) {
  if (!value) return ""
  return new Date(value).toISOString().slice(0, 10)
}

const EMPTY_DRAFT = {
  title: "",
  organization: "",
  description: "",
  startDate: "",
  endDate: "",
  isCurrent: false,
}

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
  const [draft, setDraft] = useState(EMPTY_DRAFT)

  const editing = useMemo(
    () => experiences.find((item) => item.id === editingId) ?? null,
    [editingId, experiences],
  )

  function reset() {
    setDraft(EMPTY_DRAFT)
    setAdding(false)
    setEditingId(null)
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
          onClick={() => {
            setAdding((current) => !current)
            setEditingId(null)
            setDraft(EMPTY_DRAFT)
          }}
        >
          <Plus className="h-3.5 w-3.5" />
          Add
        </Button>
      </CardHeader>

      <CardContent className="space-y-4">
        {adding && (
          <div className="border border-border/30 p-4 space-y-3">
            <Input placeholder="Role title" value={draft.title} onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))} />
            <Input placeholder="Organization" value={draft.organization} onChange={(event) => setDraft((current) => ({ ...current, organization: event.target.value }))} />
            <Textarea placeholder="Description" value={draft.description} onChange={(event) => setDraft((current) => ({ ...current, description: event.target.value }))} />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input type="date" value={draft.startDate} onChange={(event) => setDraft((current) => ({ ...current, startDate: event.target.value }))} />
              <Input type="date" value={draft.endDate} onChange={(event) => setDraft((current) => ({ ...current, endDate: event.target.value }))} disabled={draft.isCurrent} />
            </div>
            <label className="flex items-center gap-2 text-xs text-muted-foreground">
              <input
                type="checkbox"
                checked={draft.isCurrent}
                onChange={(event) => setDraft((current) => ({ ...current, isCurrent: event.target.checked, endDate: event.target.checked ? "" : current.endDate }))}
              />
              Current position
            </label>
            <div className="flex gap-2">
              <Button
                type="button"
                size="sm"
                className="gap-1.5"
                disabled={creating || !draft.title.trim() || !draft.organization.trim() || !draft.startDate}
                onClick={() => {
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
              >
                <Save className="h-3.5 w-3.5" />
                {creating ? "Saving..." : "Save"}
              </Button>
              <Button type="button" size="sm" variant="ghost" onClick={() => setAdding(false)}>
                Cancel
              </Button>
            </div>
          </div>
        )}

        {experiences.length === 0 && !adding && (
          <p className="text-sm text-muted-foreground">No experience entries yet.</p>
        )}

        {experiences.map((item) => {
          const isEditing = editing?.id === item.id

          if (isEditing) {
            return (
              <div key={item.id} className="border border-border/30 p-4 space-y-3">
                <Input defaultValue={editing.title} onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))} />
                <Input defaultValue={editing.organization} onChange={(event) => setDraft((current) => ({ ...current, organization: event.target.value }))} />
                <Textarea defaultValue={editing.description ?? ""} onChange={(event) => setDraft((current) => ({ ...current, description: event.target.value }))} />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input type="date" defaultValue={toInputDate(editing.startDate)} onChange={(event) => setDraft((current) => ({ ...current, startDate: event.target.value }))} />
                  <Input type="date" defaultValue={toInputDate(editing.endDate)} onChange={(event) => setDraft((current) => ({ ...current, endDate: event.target.value }))} disabled={draft.isCurrent} />
                </div>
                <label className="flex items-center gap-2 text-xs text-muted-foreground">
                  <input type="checkbox" defaultChecked={editing.isCurrent} onChange={(event) => setDraft((current) => ({ ...current, isCurrent: event.target.checked }))} />
                  Current position
                </label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    className="gap-1.5"
                    disabled={updating}
                    onClick={() => {
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
                  >
                    <Save className="h-3.5 w-3.5" />
                    {updating ? "Updating..." : "Update"}
                  </Button>
                  <Button type="button" size="sm" variant="ghost" onClick={() => setEditingId(null)}>
                    <X className="h-3.5 w-3.5" />
                    Cancel
                  </Button>
                </div>
              </div>
            )
          }

          return (
            <div key={item.id} className="border border-border/30 p-4 space-y-2">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h4 className="text-sm font-semibold text-heading">{item.title}</h4>
                  <p className="text-xs text-muted-foreground">{item.organization}</p>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7"
                    onClick={() => {
                      setEditingId(item.id)
                      setDraft({
                        title: item.title,
                        organization: item.organization,
                        description: item.description ?? "",
                        startDate: toInputDate(item.startDate),
                        endDate: toInputDate(item.endDate),
                        isCurrent: item.isCurrent,
                      })
                    }}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7 text-destructive"
                    disabled={deleting}
                    onClick={() => {
                      void onDelete(item.id)
                    }}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                {new Date(item.startDate).toLocaleDateString()} - {item.isCurrent ? "Present" : item.endDate ? new Date(item.endDate).toLocaleDateString() : "N/A"}
              </p>
              {item.description && <p className="text-sm text-foreground/80">{item.description}</p>}
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
