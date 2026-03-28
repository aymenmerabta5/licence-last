"use client"

import { Building2, Loader2 } from "lucide-react"
import * as motion from "motion/react-client"
import { useTranslations } from "next-intl"
import type { RefObject } from "react"
import { UniversityCard } from "@/app/[locale]/(authenticated)/dashboard/admin/universities/_components/UniversityValidationList/components/UniversityCard"
import type { UniversityListItem } from "@/app/[locale]/(authenticated)/dashboard/admin/universities/_components/UniversityValidationList/types"
import { ease } from "@/lib/animations"

interface UniversityValidationContentProps {
  universities: UniversityListItem[]
  isLoading: boolean
  isFetchingNextPage: boolean
  sentinelRef: RefObject<HTMLDivElement | null>
  onApprove: (id: string) => void
  onReject: (id: string) => void
  onEdit: (university: UniversityListItem) => void
  onDelete: (university: UniversityListItem) => void
  isApproving: boolean
  isRejecting: boolean
  isUpdating: boolean
  isDeleting: boolean
}

export function UniversityValidationContent({
  universities,
  isLoading,
  isFetchingNextPage,
  sentinelRef,
  onApprove,
  onReject,
  onEdit,
  onDelete,
  isApproving,
  isRejecting,
  isUpdating,
  isDeleting,
}: UniversityValidationContentProps) {
  const t = useTranslations("dashboard.admin.universities")

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
        <span className="text-xs uppercase tracking-[0.1em] text-muted-foreground">
          Loading universities
        </span>
      </div>
    )
  }

  if (universities.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, ease }}
        className="border border-dashed border-border/60 p-12 text-center space-y-4"
      >
        <div className="mx-auto flex h-14 w-14 items-center justify-center border border-border/50 bg-muted/30">
          <Building2 className="h-6 w-6 text-muted-foreground/40" />
        </div>
        <div className="space-y-2">
          <p className="font-serif text-lg text-heading">
            {t("noUniversities")}
          </p>
          <p className="text-sm font-light text-muted-foreground">
            No universities match the current filter.
          </p>
        </div>
      </motion.div>
    )
  }

  return (
    <>
      <div className="border-t border-border">
        {universities.map((university, index) => (
          <motion.div
            key={university.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.05, ease }}
          >
            <UniversityCard
              university={university}
              onApprove={onApprove}
              onReject={onReject}
              onEdit={onEdit}
              onDelete={onDelete}
              isApproving={isApproving}
              isRejecting={isRejecting}
              isUpdating={isUpdating}
              isDeleting={isDeleting}
            />
          </motion.div>
        ))}
      </div>

      <div ref={sentinelRef} className="h-4" />

      {isFetchingNextPage && (
        <div className="flex items-center justify-center gap-2 py-6">
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
          <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground">
            {t("loadingMore")}
          </span>
        </div>
      )}
    </>
  )
}
