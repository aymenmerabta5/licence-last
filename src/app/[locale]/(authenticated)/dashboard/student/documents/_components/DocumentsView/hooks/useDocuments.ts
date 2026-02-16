"use client"

import { useState } from "react"
import { useMutation, useQuery } from "@tanstack/react-query"
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

export function useDocuments() {
  const locale = useLocale()
  const t = useTranslations("dashboard.documents")
  const [downloadingDocumentId, setDownloadingDocumentId] = useState<string | null>(
    null,
  )

  const documentsQuery = useQuery(orpc.documents.listByStudent.queryOptions())
  const downloadMutation = useMutation(orpc.documents.download.mutationOptions())

  const handleDownload = async (documentId: string) => {
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
    downloadingDocumentId,
    handleDownload,
  }
}
