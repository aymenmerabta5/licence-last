import type { PlacementDocumentStatus } from "@/app/[locale]/(authenticated)/dashboard/company/documents/_components/CompanyDocumentsView/types"

export type DocumentStatus =
  | PlacementDocumentStatus
  | "notGenerated"
  | "revoked"

export const STATUS_STYLES: Record<DocumentStatus, string> = {
  notGenerated: "bg-muted text-muted-foreground border-border",
  pending:
    "bg-amber-500/10 text-amber-700 border-amber-500/20 dark:text-amber-300 dark:bg-amber-950/30 dark:border-amber-500/30",
  generated:
    "bg-emerald-500/10 text-emerald-700 border-emerald-500/20 dark:text-emerald-300 dark:bg-emerald-950/30 dark:border-emerald-500/30",
  failed: "bg-destructive/10 text-destructive border-destructive/20",
  revoked:
    "bg-red-500/10 text-red-700 border-red-500/20 dark:text-red-300 dark:bg-red-950/30 dark:border-red-500/30",
}

type DocumentActionVariant = "editorial" | "editorial-outline"
type DocumentActionKind = "download" | "generate" | "none"

interface DownloadActionLabels {
  download: string
  downloading: string
  pending: string
  failed: string
}

interface CertificateActionLabels extends DownloadActionLabels {
  generate: string
  generating: string
  ownerOnlyGenerate: string
}

export interface DocumentActionState {
  actionKind: DocumentActionKind
  actionVariant: DocumentActionVariant
  actionLabel: string
  actionLoadingLabel: string
  showDownloadIcon: boolean
  isActionDisabled: boolean
}

export function getReadonlyDocumentActionState(
  status: PlacementDocumentStatus,
  isLoading: boolean,
  labels: DownloadActionLabels,
  isRevoked = false,
): DocumentActionState {
  if (isRevoked) {
    return {
      actionKind: "none",
      actionVariant: "editorial-outline",
      actionLabel: "revoked",
      actionLoadingLabel: "revoked",
      showDownloadIcon: false,
      isActionDisabled: true,
    }
  }

  if (status === "generated") {
    return {
      actionKind: "download",
      actionVariant: "editorial-outline",
      actionLabel: labels.download,
      actionLoadingLabel: labels.downloading,
      showDownloadIcon: true,
      isActionDisabled: isLoading,
    }
  }

  return {
    actionKind: "none",
    actionVariant: "editorial-outline",
    actionLabel: status === "pending" ? labels.pending : labels.failed,
    actionLoadingLabel: status === "pending" ? labels.pending : labels.failed,
    showDownloadIcon: false,
    isActionDisabled: true,
  }
}

export function getCertificateActionState(params: {
  status: PlacementDocumentStatus | "notGenerated"
  isOwner: boolean
  isLoading: boolean
  labels: CertificateActionLabels
}): DocumentActionState {
  const { status, isOwner, isLoading, labels } = params

  if (status === "generated") {
    return {
      actionKind: "download",
      actionVariant: "editorial-outline",
      actionLabel: labels.download,
      actionLoadingLabel: labels.downloading,
      showDownloadIcon: true,
      isActionDisabled: isLoading,
    }
  }

  if (status === "pending") {
    return {
      actionKind: "none",
      actionVariant: "editorial-outline",
      actionLabel: labels.pending,
      actionLoadingLabel: labels.pending,
      showDownloadIcon: false,
      isActionDisabled: true,
    }
  }

  if (!isOwner) {
    return {
      actionKind: "none",
      actionVariant: "editorial-outline",
      actionLabel: labels.ownerOnlyGenerate,
      actionLoadingLabel: labels.ownerOnlyGenerate,
      showDownloadIcon: false,
      isActionDisabled: true,
    }
  }

  return {
    actionKind: "generate",
    actionVariant: "editorial",
    actionLabel: labels.generate,
    actionLoadingLabel: labels.generating,
    showDownloadIcon: false,
    isActionDisabled: isLoading,
  }
}
