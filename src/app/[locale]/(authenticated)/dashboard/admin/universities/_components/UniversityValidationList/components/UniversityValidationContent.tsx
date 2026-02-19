"use client"

import { Building2, Loader2 } from "lucide-react"
import * as motion from "motion/react-client"
import { useTranslations } from "next-intl"
import { UniversityCard } from "@/app/[locale]/(authenticated)/dashboard/admin/universities/_components/UniversityValidationList/components/UniversityCard"
import type { UniversityListItem } from "@/app/[locale]/(authenticated)/dashboard/admin/universities/_components/UniversityValidationList/types"
import { ease } from "@/lib/animations"

interface UniversityValidationContentProps {
  universities: UniversityListItem[]
  isLoading: boolean
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
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground/40" />
      </div>
    )
  }

  if (universities.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, ease }}
        className="flex flex-col items-center justify-center border border-dashed border-border py-20 px-6 text-center"
      >
        <Building2 className="mb-4 h-8 w-8 text-muted-foreground/30 font-light" />
        <p className="font-serif text-lg tracking-tight text-heading">
          {t("noUniversities")}
        </p>
      </motion.div>
    )
  }

  return (
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
  )
}
