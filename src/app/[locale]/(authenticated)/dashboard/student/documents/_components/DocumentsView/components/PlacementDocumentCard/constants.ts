import type { PlacementDocument } from "@/app/[locale]/(authenticated)/dashboard/student/documents/_components/DocumentsView/components/PlacementDocumentCard/types"

type PlacementDocumentStatus = PlacementDocument["status"]

export const STATUS_STYLES: Record<PlacementDocumentStatus, string> = {
  pending: "bg-amber-500/10 text-amber-700 border-amber-500/20",
  generated: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20",
  failed: "bg-destructive/10 text-destructive border-destructive/20",
}
