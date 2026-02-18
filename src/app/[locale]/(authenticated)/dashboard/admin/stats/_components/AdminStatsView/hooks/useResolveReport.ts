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

  const mutation = useMutation(
    orpc.companies.resolveReport.mutationOptions({
      onSuccess: async (_, variables) => {
        await queryClient.invalidateQueries({
          queryKey: orpc.companies.listReports.queryOptions({
            input: { status: "open", limit: 12 },
          }).queryKey,
        })
        toast.success(
          variables.status === "resolved"
            ? "Report resolved successfully."
            : "Report dismissed successfully.",
        )
      },
      onError: (error) => {
        toast.error(extractErrorMessage(error, "Failed to update report status."))
      },
    }),
  )

  return {
    isPending: mutation.isPending,
    resolveReport: mutation.mutateAsync,
  }
}
