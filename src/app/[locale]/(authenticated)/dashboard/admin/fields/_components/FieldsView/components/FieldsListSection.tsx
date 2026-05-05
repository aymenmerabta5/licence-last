"use client"

import { GraduationCap, Loader2 } from "lucide-react"
import * as motion from "motion/react-client"
import { FieldCard } from "@/app/[locale]/(authenticated)/dashboard/admin/fields/_components/FieldsView/components/FieldCard"
import type { FieldItem } from "@/app/[locale]/(authenticated)/dashboard/admin/fields/_components/FieldsView/types"
import { reveal, revealWithDelay } from "@/lib/animations"

interface FieldsListSectionProps {
  fields: FieldItem[]
  isLoading: boolean
  emptyLabel: string
  onManageSkills: (fieldId: string) => void
  onDelete: (fieldId: string) => void
}

export function FieldsListSection({
  fields,
  isLoading,
  emptyLabel,
  onManageSkills,
  onDelete,
}: FieldsListSectionProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
        <span className="text-xs uppercase tracking-[0.1em] text-muted-foreground">
          Loading fields
        </span>
      </div>
    )
  }

  if (fields.length === 0) {
    return (
      <motion.div
        {...reveal}
        transition={revealWithDelay(0.16)}
        className="border border-dashed border-border/60 p-12 text-center space-y-4"
      >
        <div className="mx-auto flex h-14 w-14 items-center justify-center border border-border/50 bg-muted/30">
          <GraduationCap className="h-6 w-6 text-muted-foreground/40" />
        </div>
        <div className="space-y-1">
          <p className="font-serif text-lg text-heading">No fields</p>
          <p className="text-sm font-light text-muted-foreground">
            {emptyLabel}
          </p>
        </div>
      </motion.div>
    )
  }

  return (
    <div className="space-y-3">
      {fields.map((field, index) => (
        <motion.div
          key={field.id}
          {...reveal}
          transition={revealWithDelay(0.03 * index)}
        >
          <FieldCard
            id={field.id}
            name={field.name}
            slug={field.slug}
            description={field.description}
            skillCount={field.skillCount}
            onManageSkills={onManageSkills}
            onDelete={onDelete}
          />
        </motion.div>
      ))}
    </div>
  )
}
