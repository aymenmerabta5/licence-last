"use client"

import { FileText, Trash2, Upload } from "lucide-react"
import * as motion from "motion/react-client"
import { useTranslations } from "next-intl"
import { useRef } from "react"

import type { StudentCvResume } from "@/app/[locale]/(authenticated)/dashboard/student/cv/_components/StudentCvView/types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ease, reveal } from "@/lib/animations"

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
  const t = useTranslations("dashboard.student.cv")
  const fileInputRef = useRef<HTMLInputElement>(null)

  return (
    <motion.section
      {...reveal}
      transition={{ duration: 0.6, ease, delay: 0.1 }}
      className="border border-border/50"
    >
      <div className="flex items-center justify-between gap-4 border-b border-border/50 px-6 py-4">
        <div className="flex items-center gap-3">
          <h2 className="font-serif text-xl text-heading">{t("resume")}</h2>
          {resume && (
            <Badge
              variant="outline"
              className="text-[10px] font-bold uppercase tracking-[0.18em]"
            >
              {t("uploaded")}
            </Badge>
          )}
        </div>
        <Button
          type="button"
          size="editorial-sm"
          variant="editorial-outline"
          disabled={isUploading}
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="h-3.5 w-3.5" />
          {isUploading ? t("uploading") : t("uploadPdf")}
        </Button>
      </div>

      <div className="px-6 py-6">
        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={async (event) => {
            const input = event.currentTarget
            const file = input.files?.[0]
            if (!file) return

            input.value = ""
            await onUpload(file)
          }}
        />

        {resume ? (
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-border/50 bg-primary/5">
                <FileText className="h-4 w-4 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-heading truncate">
                  {resume.fileName}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatBytes(resume.fileSizeBytes)} · {t("uploaded")}{" "}
                  {new Date(resume.uploadedAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                size="sm"
                variant="editorial-outline"
                onClick={() =>
                  window.open(resume.fileUrl, "_blank", "noopener,noreferrer")
                }
              >
                {t("open")}
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
                {isDeleting ? t("deleting") : t("delete")}
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-3 py-8 text-center">
            <div className="flex h-12 w-12 items-center justify-center border border-dashed border-border/60">
              <FileText className="h-5 w-5 text-muted-foreground/40" />
            </div>
            <p className="text-sm text-muted-foreground">
              {t("noResume")}
            </p>
          </div>
        )}
      </div>
    </motion.section>
  )
}
