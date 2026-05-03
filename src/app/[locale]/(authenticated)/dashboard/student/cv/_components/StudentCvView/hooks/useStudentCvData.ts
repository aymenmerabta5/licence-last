"use client"

import type { QueryKey } from "@tanstack/react-query"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useMemo } from "react"

import { orpc } from "@/server/orpc/client"

interface StudentCvDataType {
  experiences: Array<{
    id: string
    title: string
    organization: string
    description: string | null
    startDate: Date
    endDate: Date | null
    isCurrent: boolean
    createdAt: Date
    updatedAt: Date
  }>
  projects: Array<{
    id: string
    name: string
    summary: string
    projectUrl: string | null
    repositoryUrl: string | null
    startDate: Date | null
    endDate: Date | null
    createdAt: Date
    updatedAt: Date
  }>
  resume: {
    fileKey: string
    fileName: string
    fileUrl: string
    fileSizeBytes: number
    mimeType: string
    uploadedAt: Date
  } | null
}

export function useStudentCvData() {
  const queryClient = useQueryClient()
  const cvQueryOptions = useMemo(() => orpc.studentCv.get.queryOptions(), [])
  const cvQuery = useQuery(cvQueryOptions)
  const cvQueryKey = cvQueryOptions.queryKey as QueryKey

  const createExperienceMutation = useMutation({
    ...orpc.studentCv.createExperience.mutationOptions(),
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: cvQueryKey })
      const previousData =
        queryClient.getQueryData<StudentCvDataType>(cvQueryKey)
      queryClient.setQueryData<StudentCvDataType>(cvQueryKey, (old) => {
        if (!old) return old
        const tempId = crypto.randomUUID()
        const newExperience = {
          id: tempId,
          title: variables.title,
          organization: variables.organization,
          description: variables.description?.trim()
            ? variables.description.trim()
            : null,
          startDate: new Date(variables.startDate),
          endDate: variables.isCurrent
            ? null
            : variables.endDate
              ? new Date(variables.endDate)
              : null,
          isCurrent: variables.isCurrent ?? false,
          createdAt: new Date(),
          updatedAt: new Date(),
        }
        return {
          ...old,
          experiences: [newExperience, ...(old.experiences ?? [])],
        }
      })
      return { previousData }
    },
    onError: (_err, _variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(cvQueryKey, context.previousData)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: cvQueryKey })
    },
  })

  const updateExperienceMutation = useMutation({
    ...orpc.studentCv.updateExperience.mutationOptions(),
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: cvQueryKey })
      const previousData =
        queryClient.getQueryData<StudentCvDataType>(cvQueryKey)
      queryClient.setQueryData<StudentCvDataType>(cvQueryKey, (old) => {
        if (!old) return old
        return {
          ...old,
          experiences: old.experiences.map((exp) => {
            if (exp.id !== variables.experienceId) return exp
            const nextIsCurrent =
              variables.isCurrent !== undefined
                ? variables.isCurrent
                : exp.isCurrent
            const nextStartDate = variables.startDate
              ? new Date(variables.startDate)
              : exp.startDate
            let nextEndDate = exp.endDate
            if (variables.endDate !== undefined) {
              nextEndDate = variables.endDate
                ? new Date(variables.endDate)
                : null
            }
            if (variables.isCurrent !== undefined) {
              nextEndDate = nextIsCurrent ? null : nextEndDate
            }
            return {
              ...exp,
              ...(variables.title !== undefined && {
                title: variables.title,
              }),
              ...(variables.organization !== undefined && {
                organization: variables.organization,
              }),
              ...(variables.description !== undefined && {
                description: variables.description?.trim()
                  ? variables.description.trim()
                  : null,
              }),
              ...(variables.startDate !== undefined && {
                startDate: nextStartDate,
              }),
              ...(variables.isCurrent !== undefined && {
                isCurrent: nextIsCurrent,
              }),
              ...((variables.endDate !== undefined ||
                variables.isCurrent !== undefined) && {
                endDate: nextEndDate,
              }),
              updatedAt: new Date(),
            }
          }),
        }
      })
      return { previousData }
    },
    onError: (_err, _variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(cvQueryKey, context.previousData)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: cvQueryKey })
    },
  })

  const deleteExperienceMutation = useMutation({
    ...orpc.studentCv.deleteExperience.mutationOptions(),
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: cvQueryKey })
      const previousData =
        queryClient.getQueryData<StudentCvDataType>(cvQueryKey)
      queryClient.setQueryData<StudentCvDataType>(cvQueryKey, (old) => {
        if (!old) return old
        return {
          ...old,
          experiences: old.experiences.filter(
            (exp) => exp.id !== variables.experienceId,
          ),
        }
      })
      return { previousData }
    },
    onError: (_err, _variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(cvQueryKey, context.previousData)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: cvQueryKey })
    },
  })

  const createProjectMutation = useMutation({
    ...orpc.studentCv.createProject.mutationOptions(),
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: cvQueryKey })
      const previousData =
        queryClient.getQueryData<StudentCvDataType>(cvQueryKey)
      queryClient.setQueryData<StudentCvDataType>(cvQueryKey, (old) => {
        if (!old) return old
        const tempId = crypto.randomUUID()
        const newProject = {
          id: tempId,
          name: variables.name,
          summary: variables.summary,
          projectUrl: variables.projectUrl?.trim()
            ? variables.projectUrl.trim()
            : null,
          repositoryUrl: variables.repositoryUrl?.trim()
            ? variables.repositoryUrl.trim()
            : null,
          startDate: variables.startDate ? new Date(variables.startDate) : null,
          endDate: variables.endDate ? new Date(variables.endDate) : null,
          createdAt: new Date(),
          updatedAt: new Date(),
        }
        return {
          ...old,
          projects: [newProject, ...(old.projects ?? [])],
        }
      })
      return { previousData }
    },
    onError: (_err, _variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(cvQueryKey, context.previousData)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: cvQueryKey })
    },
  })

  const updateProjectMutation = useMutation({
    ...orpc.studentCv.updateProject.mutationOptions(),
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: cvQueryKey })
      const previousData =
        queryClient.getQueryData<StudentCvDataType>(cvQueryKey)
      queryClient.setQueryData<StudentCvDataType>(cvQueryKey, (old) => {
        if (!old) return old
        return {
          ...old,
          projects: old.projects.map((proj) => {
            if (proj.id !== variables.projectId) return proj
            return {
              ...proj,
              ...(variables.name !== undefined && { name: variables.name }),
              ...(variables.summary !== undefined && {
                summary: variables.summary,
              }),
              ...(variables.projectUrl !== undefined && {
                projectUrl: variables.projectUrl?.trim()
                  ? variables.projectUrl.trim()
                  : null,
              }),
              ...(variables.repositoryUrl !== undefined && {
                repositoryUrl: variables.repositoryUrl?.trim()
                  ? variables.repositoryUrl.trim()
                  : null,
              }),
              ...(variables.startDate !== undefined && {
                startDate: variables.startDate
                  ? new Date(variables.startDate)
                  : null,
              }),
              ...(variables.endDate !== undefined && {
                endDate: variables.endDate ? new Date(variables.endDate) : null,
              }),
              updatedAt: new Date(),
            }
          }),
        }
      })
      return { previousData }
    },
    onError: (_err, _variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(cvQueryKey, context.previousData)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: cvQueryKey })
    },
  })

  const deleteProjectMutation = useMutation({
    ...orpc.studentCv.deleteProject.mutationOptions(),
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: cvQueryKey })
      const previousData =
        queryClient.getQueryData<StudentCvDataType>(cvQueryKey)
      queryClient.setQueryData<StudentCvDataType>(cvQueryKey, (old) => {
        if (!old) return old
        return {
          ...old,
          projects: old.projects.filter(
            (proj) => proj.id !== variables.projectId,
          ),
        }
      })
      return { previousData }
    },
    onError: (_err, _variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(cvQueryKey, context.previousData)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: cvQueryKey })
    },
  })

  const uploadResumeMutation = useMutation({
    ...orpc.studentCv.uploadResume.mutationOptions(),
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: cvQueryKey })
      const previousData =
        queryClient.getQueryData<StudentCvDataType>(cvQueryKey)
      queryClient.setQueryData<StudentCvDataType>(cvQueryKey, (old) => {
        if (!old) return old
        return {
          ...old,
          resume: {
            fileKey: "",
            fileName: variables.file.name,
            fileUrl: URL.createObjectURL(variables.file),
            fileSizeBytes: variables.file.size,
            mimeType: variables.file.type,
            uploadedAt: new Date(),
          },
        }
      })
      return { previousData }
    },
    onError: (_err, _variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(cvQueryKey, context.previousData)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: cvQueryKey })
    },
  })

  const deleteResumeMutation = useMutation({
    ...orpc.studentCv.deleteResume.mutationOptions(),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: cvQueryKey })
      const previousData =
        queryClient.getQueryData<StudentCvDataType>(cvQueryKey)
      queryClient.setQueryData<StudentCvDataType>(cvQueryKey, (old) => {
        if (!old) return old
        return { ...old, resume: null }
      })
      return { previousData }
    },
    onError: (_err, _variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(cvQueryKey, context.previousData)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: cvQueryKey })
    },
  })

  return {
    cv: cvQuery.data,
    isLoading: cvQuery.isLoading,
    isError: cvQuery.isError,
    error: cvQuery.error,
    refetch: cvQuery.refetch,
    createExperienceMutation,
    updateExperienceMutation,
    deleteExperienceMutation,
    createProjectMutation,
    updateProjectMutation,
    deleteProjectMutation,
    uploadResumeMutation,
    deleteResumeMutation,
  }
}
