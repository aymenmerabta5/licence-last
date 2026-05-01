"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useTranslations } from "next-intl"
import { useMemo, useState } from "react"
import { toast } from "sonner"
import type { ApplicationJourney } from "@/app/[locale]/(authenticated)/dashboard/applications/_components/ApplicationsHubView/types"
import { STAGE_COLUMNS } from "@/lib/constants/pipeline"
import { orpc, orpcClient } from "@/server/orpc/client"

export type FilterTab = "all" | "action_required" | "in_progress" | "finalized"

function base64ToBlob(base64: string, type: string): Blob {
  const byteCharacters = atob(base64)
  const byteNumbers = new Array<number>(byteCharacters.length)
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i)
  }
  const byteArray = new Uint8Array(byteNumbers)
  return new Blob([byteArray], { type })
}

export function useApplicationHub() {
  const t = useTranslations("dashboard.applications.hub")
  const queryClient = useQueryClient()

  const [filter, setFilter] = useState<FilterTab>("all")
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [withdrawingId, setWithdrawingId] = useState<string | null>(null)
  const [confirmingSlotId, setConfirmingSlotId] = useState<string | null>(null)
  const [downloadingDocumentId, setDownloadingDocumentId] = useState<string | null>(null)

  const journeysQuery = useQuery({
    queryKey: ["applications", "hub", "journeys"],
    queryFn: async () => {
      const [appsResult, interviewsResult, docsResult] = await Promise.all([
        orpcClient.applications.listByStudent({ limit: 100 }),
        orpcClient.interviews.listForStudent({}),
        orpcClient.documents.listByStudent(),
      ])

      const journeys: ApplicationJourney[] = appsResult.applications.map((app) => {
        const appInterviews = interviewsResult.filter((i) => i.applicationId === app.id)
        const appPlacement = docsResult.find((p) => p.applicationId === app.id)

        return {
          ...app,
          interviews: appInterviews.map((i) => ({
            id: i.id,
            status: i.status,
            note: i.note,
            confirmedSlotId: i.confirmedSlotId,
            slots: i.slots.map((s) => ({
              id: s.id,
              startsAt: s.startsAt,
              endsAt: s.endsAt,
              location: s.location,
              meetingUrl: s.meetingUrl,
            })),
          })),
          placement: appPlacement
            ? {
                placementId: appPlacement.placementId,
                startDate: appPlacement.startDate,
                endDate: appPlacement.endDate,
                validatedAt: appPlacement.validatedAt,
                validatedByName: null,
                documents: appPlacement.documents.map((d) => ({
                  id: d.id,
                  type: d.type,
                  status: d.status,
                  verificationCode: d.verificationCode,
                })),
              }
            : null,
        }
      })

      return journeys
    },
  })

  const withdrawMutation = useMutation({
    ...orpc.applications.withdraw.mutationOptions(),
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: ["applications", "hub", "journeys"] })
      const previous = queryClient.getQueryData<ApplicationJourney[]>(["applications", "hub", "journeys"])
      queryClient.setQueryData<ApplicationJourney[]>(["applications", "hub", "journeys"], (old) =>
        old?.filter((j) => j.id !== variables.applicationId),
      )
      return { previous }
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["applications", "hub", "journeys"], context.previous)
      }
      toast.error(t("withdrawError"))
      setWithdrawingId(null)
    },
    onSuccess: () => {
      toast.success(t("withdrawSuccess"))
      setWithdrawingId(null)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["applications", "hub", "journeys"] })
    },
  })

  const confirmSlotMutation = useMutation({
    ...orpc.interviews.confirmSlot.mutationOptions(),
    onMutate: async (variables) => {
      setConfirmingSlotId(variables.slotId)
    },
    onError: () => {
      toast.error(t("confirmSlotError"))
      setConfirmingSlotId(null)
    },
    onSuccess: () => {
      toast.success(t("confirmSlotSuccess"))
      setConfirmingSlotId(null)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["applications", "hub", "journeys"] })
    },
  })

  const downloadMutation = useMutation({
    ...orpc.documents.download.mutationOptions(),
    onMutate: async (variables) => {
      setDownloadingDocumentId(variables.documentId)
    },
    onError: () => {
      toast.error(t("downloadError"))
      setDownloadingDocumentId(null)
    },
    onSuccess: (data) => {
      if (data.pdfBase64) {
        const blob = base64ToBlob(data.pdfBase64, "application/pdf")
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = data.fileName
        a.click()
        URL.revokeObjectURL(url)
      }
      toast.success(t("downloadSuccess"))
      setDownloadingDocumentId(null)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["applications", "hub", "journeys"] })
    },
  })

  const journeys = journeysQuery.data ?? []
  const isLoading = journeysQuery.isLoading
  const isError = journeysQuery.isError

  const filteredJourneys = useMemo(() => {
    switch (filter) {
      case "all":
        return journeys
      case "action_required":
        return journeys.filter((j) => {
          const hasPendingInterview = j.interviews.some((i) => i.status === "pending_confirmation")
          const hasPendingDocs = j.placement?.documents.some((d) => d.status === "pending")
          return hasPendingInterview || hasPendingDocs
        })
      case "in_progress":
        return journeys.filter((j) =>
          ["applied", "screening", "interview", "offer"].includes(j.pipelineStage),
        )
      case "finalized":
        return journeys.filter(
          (j) => ["accepted", "rejected"].includes(j.pipelineStage) || j.status === "withdrawn",
        )
      default:
        return journeys
    }
  }, [journeys, filter])

  const counts = useMemo(() => {
    const record: Record<string, number> = {}
    for (const stage of STAGE_COLUMNS) {
      record[stage] = journeys.filter((j) => j.pipelineStage === stage).length
    }
    record.withdrawn = journeys.filter((j) => j.status === "withdrawn").length
    return record
  }, [journeys])

  const onWithdraw = (applicationId: string) => {
    if (!window.confirm(t("withdrawConfirm"))) return
    setWithdrawingId(applicationId)
    withdrawMutation.mutate({ applicationId })
  }

  const onConfirmSlot = (interviewId: string, slotId: string) => {
    confirmSlotMutation.mutate({ interviewId, slotId })
  }

  const onDownloadDocument = (documentId: string) => {
    downloadMutation.mutate({ documentId })
  }

  return {
    journeys: filteredJourneys,
    isLoading,
    isError,
    counts,
    activeFilter: filter,
    onFilterChange: setFilter,
    expandedId,
    onToggleExpand: setExpandedId,
    onWithdraw,
    withdrawingId,
    onConfirmSlot,
    confirmingSlotId,
    onDownloadDocument,
    downloadingDocumentId,
  }
}
