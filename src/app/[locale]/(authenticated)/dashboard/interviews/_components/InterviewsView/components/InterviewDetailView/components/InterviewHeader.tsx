"use client"

import { Building2 } from "lucide-react"
import { useTranslations } from "next-intl"
import { InterviewStatusBadge } from "@/app/[locale]/(authenticated)/dashboard/interviews/_components/InterviewsView/components/InterviewStatusBadge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import type { InterviewDetailViewProps } from "@/app/[locale]/(authenticated)/dashboard/interviews/_components/InterviewsView/components/InterviewDetailView/types"

export function InterviewHeader({
  interview,
}: {
  interview: InterviewDetailViewProps["interview"]
}) {
  const t = useTranslations("dashboard.interviews.detail")

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="font-serif text-[clamp(1.5rem,4vw,2.25rem)] leading-tight tracking-tight text-heading">
            {interview.offerTitle}
          </h1>
          <div className="flex items-center gap-2 text-sm font-light text-muted-foreground">
            <span>{t("companyLabel")}:</span>
            <span className="font-medium text-foreground">
              {interview.companyName}
            </span>
          </div>
        </div>
        <Avatar size="lg">
          {interview.companyLogoUrl && (
            <AvatarImage
              src={interview.companyLogoUrl}
              alt={interview.companyName}
            />
          )}
          <AvatarFallback>
            <Building2 className="h-5 w-5" aria-hidden="true" />
          </AvatarFallback>
        </Avatar>
      </div>
      <InterviewStatusBadge status={interview.status} />
    </div>
  )
}
