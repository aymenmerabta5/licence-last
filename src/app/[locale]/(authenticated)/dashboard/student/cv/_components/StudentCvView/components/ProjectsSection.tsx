"use client"

import { useState } from "react"
import { Link2, Pencil, Plus, Save, Trash2, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

import type { StudentCvProject } from "@/app/[locale]/(authenticated)/dashboard/student/cv/_components/StudentCvView/types"

interface ProjectsSectionProps {
  projects: StudentCvProject[]
  creating: boolean
  updating: boolean
  deleting: boolean
  onCreate: (input: {
    name: string
    summary: string
    projectUrl?: string
    repositoryUrl?: string
    startDate?: string
    endDate?: string
  }) => Promise<void>
  onUpdate: (input: {
    projectId: string
    name?: string
    summary?: string
    projectUrl?: string | null
    repositoryUrl?: string | null
    startDate?: string | null
    endDate?: string | null
  }) => Promise<void>
  onDelete: (projectId: string) => Promise<void>
}

function toInputDate(value: Date | string | null) {
  if (!value) return ""
  return new Date(value).toISOString().slice(0, 10)
}

const EMPTY_DRAFT = {
  name: "",
  summary: "",
  projectUrl: "",
  repositoryUrl: "",
  startDate: "",
  endDate: "",
}

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
  const [draft, setDraft] = useState(EMPTY_DRAFT)

  function reset() {
    setDraft(EMPTY_DRAFT)
    setAdding(false)
    setEditingId(null)
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
            <Input placeholder="Project name" value={draft.name} onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))} />
            <Textarea placeholder="Project summary" value={draft.summary} onChange={(event) => setDraft((current) => ({ ...current, summary: event.target.value }))} />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input placeholder="Project URL" value={draft.projectUrl} onChange={(event) => setDraft((current) => ({ ...current, projectUrl: event.target.value }))} />
              <Input placeholder="Repository URL" value={draft.repositoryUrl} onChange={(event) => setDraft((current) => ({ ...current, repositoryUrl: event.target.value }))} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input type="date" value={draft.startDate} onChange={(event) => setDraft((current) => ({ ...current, startDate: event.target.value }))} />
              <Input type="date" value={draft.endDate} onChange={(event) => setDraft((current) => ({ ...current, endDate: event.target.value }))} />
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                size="sm"
                className="gap-1.5"
                disabled={creating || !draft.name.trim() || !draft.summary.trim()}
                onClick={() => {
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

        {projects.length === 0 && !adding && (
          <p className="text-sm text-muted-foreground">No projects added yet.</p>
        )}

        {projects.map((project) => {
          const isEditing = editingId === project.id

          if (isEditing) {
            return (
              <div key={project.id} className="border border-border/30 p-4 space-y-3">
                <Input defaultValue={project.name} onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))} />
                <Textarea defaultValue={project.summary} onChange={(event) => setDraft((current) => ({ ...current, summary: event.target.value }))} />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input defaultValue={project.projectUrl ?? ""} placeholder="Project URL" onChange={(event) => setDraft((current) => ({ ...current, projectUrl: event.target.value }))} />
                  <Input defaultValue={project.repositoryUrl ?? ""} placeholder="Repository URL" onChange={(event) => setDraft((current) => ({ ...current, repositoryUrl: event.target.value }))} />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input type="date" defaultValue={toInputDate(project.startDate)} onChange={(event) => setDraft((current) => ({ ...current, startDate: event.target.value }))} />
                  <Input type="date" defaultValue={toInputDate(project.endDate)} onChange={(event) => setDraft((current) => ({ ...current, endDate: event.target.value }))} />
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    className="gap-1.5"
                    disabled={updating}
                    onClick={() => {
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
            <div key={project.id} className="border border-border/30 p-4 space-y-2">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h4 className="text-sm font-semibold text-heading">{project.name}</h4>
                  <p className="text-xs text-muted-foreground line-clamp-2">{project.summary}</p>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7"
                    onClick={() => {
                      setEditingId(project.id)
                      setDraft({
                        name: project.name,
                        summary: project.summary,
                        projectUrl: project.projectUrl ?? "",
                        repositoryUrl: project.repositoryUrl ?? "",
                        startDate: toInputDate(project.startDate),
                        endDate: toInputDate(project.endDate),
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
                      void onDelete(project.id)
                    }}
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
        })}
      </CardContent>
    </Card>
  )
}
