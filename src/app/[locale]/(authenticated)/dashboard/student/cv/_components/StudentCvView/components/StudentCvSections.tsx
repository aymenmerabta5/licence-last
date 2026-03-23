"use client"

import { useTranslations } from "next-intl"
import { toast } from "sonner"
import { ExperienceSection } from "@/app/[locale]/(authenticated)/dashboard/student/cv/_components/StudentCvView/components/ExperienceSection"
import { ProjectsSection } from "@/app/[locale]/(authenticated)/dashboard/student/cv/_components/StudentCvView/components/ProjectsSection"
import { ResumeSection } from "@/app/[locale]/(authenticated)/dashboard/student/cv/_components/StudentCvView/components/ResumeSection"
import type { useStudentCvData } from "@/app/[locale]/(authenticated)/dashboard/student/cv/_components/StudentCvView/hooks/useStudentCvData"
import { resolveLocalizedError } from "@/lib/error-message"

interface MutationRunner<TInput> {
  (input: TInput): Promise<unknown>
}

type StudentCvData = ReturnType<typeof useStudentCvData>

interface StudentCvSectionsProps {
  cv: StudentCvData["cv"]
  createExperienceMutation: StudentCvData["createExperienceMutation"]
  updateExperienceMutation: StudentCvData["updateExperienceMutation"]
  deleteExperienceMutation: StudentCvData["deleteExperienceMutation"]
  createProjectMutation: StudentCvData["createProjectMutation"]
  updateProjectMutation: StudentCvData["updateProjectMutation"]
  deleteProjectMutation: StudentCvData["deleteProjectMutation"]
  uploadResumeMutation: StudentCvData["uploadResumeMutation"]
  deleteResumeMutation: StudentCvData["deleteResumeMutation"]
}

async function runMutationWithToast<TInput>(
  mutateAsync: MutationRunner<TInput>,
  input: TInput,
  t: (key: string) => string,
  successMessage: string,
  errorKey: string,
) {
  try {
    await mutateAsync(input)
    toast.success(successMessage)
  } catch (error) {
    toast.error(
      resolveLocalizedError(error, {
        t,
        fallbackKey: errorKey,
      }),
    )
  }
}

export function StudentCvSections({
  cv,
  createExperienceMutation,
  updateExperienceMutation,
  deleteExperienceMutation,
  createProjectMutation,
  updateProjectMutation,
  deleteProjectMutation,
  uploadResumeMutation,
  deleteResumeMutation,
}: StudentCvSectionsProps) {
  const t = useTranslations()
  const experiences = cv?.experiences ?? []
  const projects = cv?.projects ?? []
  const resume = cv?.resume ?? null

  return (
    <>
      <ResumeSection
        resume={resume}
        isUploading={uploadResumeMutation.isPending}
        isDeleting={deleteResumeMutation.isPending}
        onUpload={(file) =>
          runMutationWithToast(
            uploadResumeMutation.mutateAsync,
            { file },
            t,
            t("errors.common.resumeUploaded"),
            "errors.common.resumeUploadFailed",
          )
        }
        onDelete={() =>
          runMutationWithToast(
            deleteResumeMutation.mutateAsync,
            {},
            t,
            t("errors.common.resumeRemoved"),
            "errors.common.resumeRemoveFailed",
          )
        }
      />

      <ExperienceSection
        experiences={experiences}
        creating={createExperienceMutation.isPending}
        updating={updateExperienceMutation.isPending}
        deleting={deleteExperienceMutation.isPending}
        onCreate={(input) =>
          runMutationWithToast(
            createExperienceMutation.mutateAsync,
            input,
            t,
            t("errors.common.experienceAdded"),
            "errors.common.experienceAddFailed",
          )
        }
        onUpdate={(input) =>
          runMutationWithToast(
            updateExperienceMutation.mutateAsync,
            input,
            t,
            t("errors.common.experienceUpdated"),
            "errors.common.experienceUpdateFailed",
          )
        }
        onDelete={(experienceId) =>
          runMutationWithToast(
            deleteExperienceMutation.mutateAsync,
            { experienceId },
            t,
            t("errors.common.experienceDeleted"),
            "errors.common.experienceDeleteFailed",
          )
        }
      />

      <ProjectsSection
        projects={projects}
        creating={createProjectMutation.isPending}
        updating={updateProjectMutation.isPending}
        deleting={deleteProjectMutation.isPending}
        onCreate={(input) =>
          runMutationWithToast(
            createProjectMutation.mutateAsync,
            input,
            t,
            t("errors.common.projectAdded"),
            "errors.common.projectAddFailed",
          )
        }
        onUpdate={(input) =>
          runMutationWithToast(
            updateProjectMutation.mutateAsync,
            input,
            t,
            t("errors.common.projectUpdated"),
            "errors.common.projectUpdateFailed",
          )
        }
        onDelete={(projectId) =>
          runMutationWithToast(
            deleteProjectMutation.mutateAsync,
            { projectId },
            t,
            t("errors.common.projectDeleted"),
            "errors.common.projectDeleteFailed",
          )
        }
      />
    </>
  )
}
