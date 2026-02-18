"use client"

import { useRef } from "react"
import { FileText, Trash2, Upload } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

import type { StudentCvResume } from "@/app/[locale]/(authenticated)/dashboard/student/cv/_components/StudentCvView/types"

interface ResumeSectionProps {
  resume: StudentCvResume | null
  isUploading: boolean
  isDeleting: boolean
  onUpload: (file: File) => Promise<void>
  onDelete: () => Promise<void>
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function ResumeSection({
  resume,
  isUploading,
  isDeleting,
  onUpload,
  onDelete,
}: ResumeSectionProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  return (
    <Card className="border-border/40 rounded-3xl">
      <CardHeader>
        <CardTitle className="font-serif text-xl">Resume</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={async (event) => {
            const file = event.target.files?.[0]
            if (!file) return
            await onUpload(file)
            event.currentTarget.value = ""
          }}
        />

        {resume ? (
          <div className="border border-border/30 p-4 space-y-3">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-heading truncate">{resume.fileName}</p>
                <p className="text-xs text-muted-foreground">
                  {formatBytes(resume.fileSizeBytes)} - Uploaded {new Date(resume.uploadedAt).toLocaleDateString()}
                </p>
              </div>
              <FileText className="h-4 w-4 text-primary shrink-0" />
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                size="sm"
                variant="editorial-outline"
                onClick={() => window.open(resume.fileUrl, "_blank", "noopener,noreferrer")}
              >
                Open
              </Button>
              <Button
                type="button"
                size="sm"
                variant="editorial-outline"
                disabled={isDeleting}
                onClick={() => {
                  void onDelete()
                }}
                className="gap-1.5 text-destructive border-destructive/30 hover:bg-destructive/5"
              >
                <Trash2 className="h-3.5 w-3.5" />
                {isDeleting ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No resume uploaded yet.</p>
        )}

        <Button
          type="button"
          size="sm"
          className="gap-1.5"
          disabled={isUploading}
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="h-3.5 w-3.5" />
          {isUploading ? "Uploading..." : "Upload PDF"}
        </Button>
      </CardContent>
    </Card>
  )
}
