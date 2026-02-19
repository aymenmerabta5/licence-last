"use client"

import { GraduationCap, Loader2 } from "lucide-react"
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
      <div className="flex flex-col items-center justify-center gap-3 py-16">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
        <span className="text-sm font-medium text-muted-foreground">
          Loading universities...
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
        className="space-y-3 py-16 text-center"
      >
        <div className="inline-flex items-center justify-center rounded-2xl bg-secondary/10 p-4">
          <GraduationCap className="h-6 w-6 text-muted-foreground/30" />
        </div>
        <p className="text-sm font-medium text-muted-foreground">
          {t("noUniversities")}
        </p>
      </motion.div>
    )
  }

  return (
    <div className="space-y-4">
      {universities.map((university, index) => (
        <motion.div
          key={university.id}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 + index * 0.06, ease }}
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
