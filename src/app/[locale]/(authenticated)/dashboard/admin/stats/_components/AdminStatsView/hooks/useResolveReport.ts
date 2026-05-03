"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { orpc } from "@/server/orpc/client"

export type ReportResolutionStatus = "resolved" | "dismissed"

export interface ResolveReportInput {
  reportId: string
  status: ReportResolutionStatus
  resolutionNote?: string
}

function extractErrorMessage(error: unknown, fallback: string) {
  if (error && typeof error === "object" && "message" in error) {
    const message = error.message
    if (typeof message === "string" && message.length > 0) {
      return message
    }
  }

  return fallback
}

export function useResolveReport() {
  const queryClient = useQueryClient()

  const reportsQueryKey = orpc.companies.listReports.queryOptions({
    input: { status: "open", limit: 12 },
  }).queryKey

  const mutation = useMutation({
    ...orpc.companies.resolveReport.mutationOptions(),
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: reportsQueryKey })
      const previousData = queryClient.getQueryData(reportsQueryKey)
      queryClient.setQueryData(reportsQueryKey, (old) => {
        if (!Array.isArray(old)) return old
        return old.filter((report) => report.id !== variables.reportId)
      })
      return { previousData }
    },
    onSuccess: async (_, variables) => {
      toast.success(
        variables.status === "resolved"
          ? "Report resolved successfully."
          : "Report dismissed successfully.",
      )
    },
    onError: (error, _variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(reportsQueryKey, context.previousData)
      }
      toast.error(extractErrorMessage(error, "Failed to update report status."))
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: reportsQueryKey })
    },
  })

  return {
    isPending: mutation.isPending,
    resolveReport: mutation.mutateAsync,
  }
}
