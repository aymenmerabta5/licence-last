"use client"

import type { ReactNode } from "react"
import { ValidationEmptyState } from "@/app/[locale]/(authenticated)/dashboard/_components/PlacementValidations/components/ValidationEmptyState"
import { ValidationHeader } from "@/app/[locale]/(authenticated)/dashboard/_components/PlacementValidations/components/ValidationHeader"
import { ValidationLoadingState } from "@/app/[locale]/(authenticated)/dashboard/_components/PlacementValidations/components/ValidationLoadingState"

interface ValidationDetailLayoutProps {
  isLoading: boolean
  hasApplication: boolean
  studentName?: string | null
  companyName?: string | null
  backHref: string
  backLabel: string
  title: string
  notFoundLabel: string
  children: ReactNode
}

export function ValidationDetailLayout({
  isLoading,
  hasApplication,
  studentName,
  companyName,
  backHref,
  backLabel,
  title,
  notFoundLabel,
  children,
}: ValidationDetailLayoutProps) {
  if (isLoading) {
    return <ValidationLoadingState maxWidthClass="max-w-5xl" />
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8 pb-16">
      <ValidationHeader
        isLoading={isLoading}
        hasApplication={hasApplication}
        studentName={studentName}
        companyName={companyName}
        backHref={backHref}
        backLabel={backLabel}
        title={title}
        notFoundLabel={notFoundLabel}
      />

      {hasApplication ? (
        children
      ) : (
        <ValidationEmptyState label={notFoundLabel} />
      )}
    </div>
  )
}
