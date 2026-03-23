"use client"

import { useTranslations } from "next-intl"
import { StudentCvSections } from "@/app/[locale]/(authenticated)/dashboard/student/cv/_components/StudentCvView/components/StudentCvSections"

import { useStudentCvData } from "@/app/[locale]/(authenticated)/dashboard/student/cv/_components/StudentCvView/hooks/useStudentCvData"
import { resolveLocalizedError } from "@/lib/error-message"

export function StudentCvView() {
  const t = useTranslations()
  const studentCvData = useStudentCvData()

  if (studentCvData.isLoading) {
    return (
      <div className="text-sm text-muted-foreground">Loading CV data...</div>
    )
  }

  if (studentCvData.isError) {
    return (
      <div className="border border-destructive/20 text-destructive p-4 text-sm">
        {resolveLocalizedError(studentCvData.error, {
          t,
          fallbackKey: "errors.common.studentCvLoadFailed",
        })}
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16">
      <header className="space-y-2">
        <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-primary">
          Student Profile
        </p>
        <h1 className="font-serif text-3xl text-heading tracking-tight">
          CV Manager
        </h1>
        <p className="text-sm text-muted-foreground">
          Manage your resume, experiences, and projects from one place.
        </p>
      </header>

      <StudentCvSections
        cv={studentCvData.cv}
        createExperienceMutation={studentCvData.createExperienceMutation}
        updateExperienceMutation={studentCvData.updateExperienceMutation}
        deleteExperienceMutation={studentCvData.deleteExperienceMutation}
        createProjectMutation={studentCvData.createProjectMutation}
        updateProjectMutation={studentCvData.updateProjectMutation}
        deleteProjectMutation={studentCvData.deleteProjectMutation}
        uploadResumeMutation={studentCvData.uploadResumeMutation}
        deleteResumeMutation={studentCvData.deleteResumeMutation}
      />
    </div>
  )
}
