"use client"

import { toast } from "sonner"

import { getErrorMessage } from "@/lib/error-message"

import { ExperienceSection } from "@/app/[locale]/(authenticated)/dashboard/student/cv/_components/StudentCvView/components/ExperienceSection"
import { ProjectsSection } from "@/app/[locale]/(authenticated)/dashboard/student/cv/_components/StudentCvView/components/ProjectsSection"
import { ResumeSection } from "@/app/[locale]/(authenticated)/dashboard/student/cv/_components/StudentCvView/components/ResumeSection"
import type { useStudentCvData } from "@/app/[locale]/(authenticated)/dashboard/student/cv/_components/StudentCvView/hooks/useStudentCvData"

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
  successMessage: string,
  errorMessage: string,
) {
  try {
    await mutateAsync(input)
    toast.success(successMessage)
  } catch (error) {
    toast.error(getErrorMessage(error, errorMessage))
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
            "Resume uploaded.",
            "Failed to upload resume.",
          )
        }
        onDelete={() =>
          runMutationWithToast(
            deleteResumeMutation.mutateAsync,
            {},
            "Resume removed.",
            "Failed to remove resume.",
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
            "Experience added.",
            "Failed to add experience.",
          )
        }
        onUpdate={(input) =>
          runMutationWithToast(
            updateExperienceMutation.mutateAsync,
            input,
            "Experience updated.",
            "Failed to update experience.",
          )
        }
        onDelete={(experienceId) =>
          runMutationWithToast(
            deleteExperienceMutation.mutateAsync,
            { experienceId },
            "Experience deleted.",
            "Failed to delete experience.",
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
            "Project added.",
            "Failed to add project.",
          )
        }
        onUpdate={(input) =>
          runMutationWithToast(
            updateProjectMutation.mutateAsync,
            input,
            "Project updated.",
            "Failed to update project.",
          )
        }
        onDelete={(projectId) =>
          runMutationWithToast(
            deleteProjectMutation.mutateAsync,
            { projectId },
            "Project deleted.",
            "Failed to delete project.",
          )
        }
      />
    </>
  )
}
