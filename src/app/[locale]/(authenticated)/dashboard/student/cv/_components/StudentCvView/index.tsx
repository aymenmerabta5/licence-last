"use client"

import { toast } from "sonner"

import { getErrorMessage } from "@/lib/error-message"

import { useStudentCvData } from "@/app/[locale]/(authenticated)/dashboard/student/cv/_components/StudentCvView/hooks/useStudentCvData"
import { ResumeSection } from "@/app/[locale]/(authenticated)/dashboard/student/cv/_components/StudentCvView/components/ResumeSection"
import { ExperienceSection } from "@/app/[locale]/(authenticated)/dashboard/student/cv/_components/StudentCvView/components/ExperienceSection"
import { ProjectsSection } from "@/app/[locale]/(authenticated)/dashboard/student/cv/_components/StudentCvView/components/ProjectsSection"

export function StudentCvView() {
  const {
    cv,
    isLoading,
    isError,
    error,
    createExperienceMutation,
    updateExperienceMutation,
    deleteExperienceMutation,
    createProjectMutation,
    updateProjectMutation,
    deleteProjectMutation,
    uploadResumeMutation,
    deleteResumeMutation,
  } = useStudentCvData()

  if (isLoading) {
    return <div className="text-sm text-muted-foreground">Loading CV data...</div>
  }

  if (isError) {
    return (
      <div className="border border-destructive/20 text-destructive p-4 text-sm">
        {getErrorMessage(error, "Failed to load CV data.")}
      </div>
    )
  }

  const experiences = cv?.experiences ?? []
  const projects = cv?.projects ?? []
  const resume = cv?.resume ?? null

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16">
      <header className="space-y-2">
        <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-primary">Student Profile</p>
        <h1 className="font-serif text-3xl text-heading tracking-tight">CV Manager</h1>
        <p className="text-sm text-muted-foreground">Manage your resume, experiences, and projects from one place.</p>
      </header>

      <ResumeSection
        resume={resume}
        isUploading={uploadResumeMutation.isPending}
        isDeleting={deleteResumeMutation.isPending}
        onUpload={async (file) => {
          try {
            await uploadResumeMutation.mutateAsync({ file })
            toast.success("Resume uploaded.")
          } catch (err) {
            toast.error(getErrorMessage(err, "Failed to upload resume."))
          }
        }}
        onDelete={async () => {
          try {
            await deleteResumeMutation.mutateAsync({})
            toast.success("Resume removed.")
          } catch (err) {
            toast.error(getErrorMessage(err, "Failed to remove resume."))
          }
        }}
      />

      <ExperienceSection
        experiences={experiences}
        creating={createExperienceMutation.isPending}
        updating={updateExperienceMutation.isPending}
        deleting={deleteExperienceMutation.isPending}
        onCreate={async (input) => {
          try {
            await createExperienceMutation.mutateAsync(input)
            toast.success("Experience added.")
          } catch (err) {
            toast.error(getErrorMessage(err, "Failed to add experience."))
          }
        }}
        onUpdate={async (input) => {
          try {
            await updateExperienceMutation.mutateAsync(input)
            toast.success("Experience updated.")
          } catch (err) {
            toast.error(getErrorMessage(err, "Failed to update experience."))
          }
        }}
        onDelete={async (experienceId) => {
          try {
            await deleteExperienceMutation.mutateAsync({ experienceId })
            toast.success("Experience deleted.")
          } catch (err) {
            toast.error(getErrorMessage(err, "Failed to delete experience."))
          }
        }}
      />

      <ProjectsSection
        projects={projects}
        creating={createProjectMutation.isPending}
        updating={updateProjectMutation.isPending}
        deleting={deleteProjectMutation.isPending}
        onCreate={async (input) => {
          try {
            await createProjectMutation.mutateAsync(input)
            toast.success("Project added.")
          } catch (err) {
            toast.error(getErrorMessage(err, "Failed to add project."))
          }
        }}
        onUpdate={async (input) => {
          try {
            await updateProjectMutation.mutateAsync(input)
            toast.success("Project updated.")
          } catch (err) {
            toast.error(getErrorMessage(err, "Failed to update project."))
          }
        }}
        onDelete={async (projectId) => {
          try {
            await deleteProjectMutation.mutateAsync({ projectId })
            toast.success("Project deleted.")
          } catch (err) {
            toast.error(getErrorMessage(err, "Failed to delete project."))
          }
        }}
      />
    </div>
  )
}
