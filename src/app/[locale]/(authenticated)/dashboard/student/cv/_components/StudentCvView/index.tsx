"use client"

import * as motion from "motion/react-client"
import { useTranslations } from "next-intl"

import { StudentCvSections } from "@/app/[locale]/(authenticated)/dashboard/student/cv/_components/StudentCvView/components/StudentCvSections"
import { useStudentCvData } from "@/app/[locale]/(authenticated)/dashboard/student/cv/_components/StudentCvView/hooks/useStudentCvData"
import { ease, reveal } from "@/lib/animations"
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
      <motion.header
        {...reveal}
        transition={{ duration: 0.6, ease }}
        className="space-y-4"
      >
        <div className="h-0.5 bg-primary" />
        <div className="space-y-3">
          <div className="space-y-2">
            <h1 className="font-serif text-[clamp(1.8rem,3.2vw,2.4rem)] leading-[1.1] tracking-tight text-heading">
              CV Manager
            </h1>
            <p className="text-sm font-light text-muted-foreground max-w-lg">
              Manage your resume, experiences, and projects from one place.
            </p>
          </div>
        </div>
      </motion.header>

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
