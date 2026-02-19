"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useMemo } from "react"

import { orpc } from "@/server/orpc/client"

export function useStudentCvData() {
  const queryClient = useQueryClient()
  const cvQueryOptions = useMemo(() => orpc.studentCv.get.queryOptions(), [])
  const cvQuery = useQuery(cvQueryOptions)

  const invalidateCv = async () => {
    await queryClient.invalidateQueries({ queryKey: cvQueryOptions.queryKey })
  }

  const createExperienceMutation = useMutation(
    orpc.studentCv.createExperience.mutationOptions({
      onSuccess: invalidateCv,
    }),
  )

  const updateExperienceMutation = useMutation(
    orpc.studentCv.updateExperience.mutationOptions({
      onSuccess: invalidateCv,
    }),
  )

  const deleteExperienceMutation = useMutation(
    orpc.studentCv.deleteExperience.mutationOptions({
      onSuccess: invalidateCv,
    }),
  )

  const createProjectMutation = useMutation(
    orpc.studentCv.createProject.mutationOptions({
      onSuccess: invalidateCv,
    }),
  )

  const updateProjectMutation = useMutation(
    orpc.studentCv.updateProject.mutationOptions({
      onSuccess: invalidateCv,
    }),
  )

  const deleteProjectMutation = useMutation(
    orpc.studentCv.deleteProject.mutationOptions({
      onSuccess: invalidateCv,
    }),
  )

  const uploadResumeMutation = useMutation(
    orpc.studentCv.uploadResume.mutationOptions({
      onSuccess: invalidateCv,
    }),
  )

  const deleteResumeMutation = useMutation(
    orpc.studentCv.deleteResume.mutationOptions({
      onSuccess: invalidateCv,
    }),
  )

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
