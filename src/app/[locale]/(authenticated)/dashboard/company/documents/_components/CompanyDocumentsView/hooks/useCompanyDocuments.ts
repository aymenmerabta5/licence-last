"use client"

import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query"
import { useLocale, useTranslations } from "next-intl"
import { useMemo, useState } from "react"
import { toast } from "sonner"

import { useDebounce, useInfiniteScroll } from "@/hooks"
import { getErrorMessage } from "@/lib/error-message"
import { orpc, orpcClient } from "@/server/orpc/client"
import type { InferRouterOutputs } from "@orpc/server"
import type { AppRouter } from "@/server/orpc/router"

type ListByCompanyResult =
  InferRouterOutputs<AppRouter>["documents"]["listByCompany"]

type SupportedLocale = "en" | "fr" | "ar"

function resolveLocale(locale: string): SupportedLocale {
  if (locale === "fr" || locale === "ar") {
    return locale
  }

  return "en"
}

function downloadPdf(pdfBase64: string, fileName: string) {
  const bytes = Uint8Array.from(atob(pdfBase64), (char) => char.charCodeAt(0))
  const blob = new Blob([bytes], { type: "application/pdf" })
  const url = URL.createObjectURL(blob)

  const link = document.createElement("a")
  link.href = url
  link.download = fileName
  link.click()

  URL.revokeObjectURL(url)
}

export function useCompanyDocuments() {
  const t = useTranslations("dashboard.companyDocuments")
  const locale = useLocale()
  const queryClient = useQueryClient()

  const [searchQuery, setSearchQuery] = useState("")
  const debouncedSearch = useDebounce(searchQuery, 300)
  const [generatingPlacementId, setGeneratingPlacementId] = useState<
    string | null
  >(null)
  const [downloadingDocumentId, setDownloadingDocumentId] = useState<
    string | null
  >(null)
  const [revokingDocumentId, setRevokingDocumentId] = useState<string | null>(
    null,
  )
  const [generateDialogOpen, setGenerateDialogOpen] = useState(false)
  const [dialogPlacementId, setDialogPlacementId] = useState<string | null>(
    null,
  )
  const [revokeDialogOpen, setRevokeDialogOpen] = useState(false)
  const [revokeDialogDocumentId, setRevokeDialogDocumentId] = useState<
    string | null
  >(null)
  const [isGeneratingMissing, setIsGeneratingMissing] = useState(false)

  const listQueryKey = useMemo(
    () =>
      [
        ...orpc.documents.listByCompany.queryOptions().queryKey,
        debouncedSearch,
      ] as const,
    [debouncedSearch],
  )

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    refetch,
  } = useInfiniteQuery<ListByCompanyResult>({
    queryKey: listQueryKey,
    queryFn: async ({ pageParam }) =>
      orpcClient.documents.listByCompany({
        cursor: pageParam as { validatedAt: string; placementId: string } | undefined,
        limit: 12,
        search: debouncedSearch || undefined,
      }),
    initialPageParam: undefined as
      | { validatedAt: string; placementId: string }
      | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  })

  const placements = useMemo(
    () => data?.pages.flatMap((page) => page.placements) ?? [],
    [data],
  )

  const sentinelRef = useInfiniteScroll(
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  )

  const generateMutation = useMutation(
    orpc.documents.generateCertificateByCompany.mutationOptions(),
  )
  const downloadMutation = useMutation(
    orpc.documents.downloadByCompany.mutationOptions(),
  )
  const revokeMutation = useMutation(
    orpc.documents.revokeCertificate.mutationOptions(),
  )
  const generateMissingMutation = useMutation(
    orpc.documents.generateMissingCertificates.mutationOptions(),
  )

  const handleOpenGenerateDialog = (placementId: string) => {
    setDialogPlacementId(placementId)
    setGenerateDialogOpen(true)
  }

  const handleGenerateCertificate = async (
    placementId: string,
    certificateLocale: string,
    borderStyle: string,
  ) => {
    setGeneratingPlacementId(placementId)

    try {
      const result = await generateMutation.mutateAsync({
        placementId,
        locale: resolveLocale(certificateLocale),
        borderStyle: borderStyle as import("@/server/pdfs/borders").BorderStyleKey,
      })

      if (result.pdfBase64) {
        downloadPdf(result.pdfBase64, result.fileName)
      }

      toast.success(t("generatedSuccess"))
      await queryClient.invalidateQueries({
        queryKey: listQueryKey,
      })
    } catch (error) {
      const message = getErrorMessage(error, t("generateError"))
      toast.error(message)
    } finally {
      setGeneratingPlacementId(null)
      setGenerateDialogOpen(false)
      setDialogPlacementId(null)
    }
  }

  const handleDownloadDocument = async (documentId: string) => {
    setDownloadingDocumentId(documentId)

    try {
      const result = await downloadMutation.mutateAsync({
        documentId,
        locale: resolveLocale(locale),
      })
      downloadPdf(result.pdfBase64, result.fileName)
    } catch (error) {
      const message = getErrorMessage(error, t("downloadError"))
      toast.error(message)
    } finally {
      setDownloadingDocumentId(null)
    }
  }

  const handleOpenRevokeDialog = (documentId: string) => {
    setRevokeDialogDocumentId(documentId)
    setRevokeDialogOpen(true)
  }

  const handleRevokeCertificate = async (reason: string) => {
    if (!revokeDialogDocumentId) return
    setRevokingDocumentId(revokeDialogDocumentId)

    try {
      await revokeMutation.mutateAsync({
        documentId: revokeDialogDocumentId,
        reason,
      })
      toast.success(t("revokeSuccess"))
      await queryClient.invalidateQueries({
        queryKey: listQueryKey,
      })
    } catch (error) {
      const message = getErrorMessage(error, t("revokeError"))
      toast.error(message)
    } finally {
      setRevokingDocumentId(null)
      setRevokeDialogOpen(false)
      setRevokeDialogDocumentId(null)
    }
  }

  const handleGenerateMissing = async (
    certificateLocale: string,
    borderStyle: string,
  ) => {
    setIsGeneratingMissing(true)

    try {
      const result = await generateMissingMutation.mutateAsync({
        locale: resolveLocale(certificateLocale),
        borderStyle: borderStyle as import("@/server/pdfs/borders").BorderStyleKey,
      })

      if (result.generatedCount > 0) {
        toast.success(
          t("generateMissingSuccess", { count: result.generatedCount }),
        )
      } else {
        toast.info(t("generateMissingDialog.noMissing"))
      }

      if (result.errors.length > 0) {
        toast.error(
          t("generateMissingError", { count: result.errors.length }),
        )
      }

      await queryClient.invalidateQueries({
        queryKey: listQueryKey,
      })
    } catch (error) {
      const message = getErrorMessage(error, t("generateMissingError"))
      toast.error(message)
    } finally {
      setIsGeneratingMissing(false)
      setGenerateDialogOpen(false)
    }
  }

  return {
    placements,
    isLoading,
    isError,
    isFetchingNextPage,
    refetch,
    generatingPlacementId,
    downloadingDocumentId,
    revokingDocumentId,
    handleGenerateCertificate,
    handleDownloadDocument,
    handleOpenRevokeDialog,
    handleRevokeCertificate,
    handleGenerateMissing,
    generateDialogOpen,
    setGenerateDialogOpen,
    dialogPlacementId,
    handleOpenGenerateDialog,
    revokeDialogOpen,
    setRevokeDialogOpen,
    revokeDialogDocumentId,
    searchQuery,
    setSearchQuery,
    isGeneratingMissing,
    sentinelRef,
  }
}
