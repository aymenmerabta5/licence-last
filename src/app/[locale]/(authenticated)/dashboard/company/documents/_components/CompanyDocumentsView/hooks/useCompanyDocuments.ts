"use client"

import { useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useLocale, useTranslations } from "next-intl"
import { toast } from "sonner"

import { orpc } from "@/server/orpc/client"

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
  const [generatingPlacementId, setGeneratingPlacementId] = useState<string | null>(
    null,
  )
  const [downloadingDocumentId, setDownloadingDocumentId] = useState<string | null>(
    null,
  )

  const listQueryOptions = orpc.documents.listByCompany.queryOptions()
  const documentsQuery = useQuery(listQueryOptions)
  const generateMutation = useMutation(
    orpc.documents.generateCertificateByCompany.mutationOptions(),
  )
  const downloadMutation = useMutation(
    orpc.documents.downloadByCompany.mutationOptions(),
  )

  const handleGenerateCertificate = async (placementId: string) => {
    setGeneratingPlacementId(placementId)

    try {
      const result = await generateMutation.mutateAsync({
        placementId,
        locale: resolveLocale(locale),
      })

      if (result.pdfBase64) {
        downloadPdf(result.pdfBase64, result.fileName)
      }

      toast.success(t("generatedSuccess"))
      await queryClient.invalidateQueries({
        queryKey: listQueryOptions.queryKey,
      })
    } catch {
      toast.error(t("generateError"))
    } finally {
      setGeneratingPlacementId(null)
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
    } catch {
      toast.error(t("downloadError"))
    } finally {
      setDownloadingDocumentId(null)
    }
  }

  return {
    placements: documentsQuery.data ?? [],
    isLoading: documentsQuery.isLoading,
    isError: documentsQuery.isError,
    refetch: documentsQuery.refetch,
    generatingPlacementId,
    downloadingDocumentId,
    handleGenerateCertificate,
    handleDownloadDocument,
  }
}
