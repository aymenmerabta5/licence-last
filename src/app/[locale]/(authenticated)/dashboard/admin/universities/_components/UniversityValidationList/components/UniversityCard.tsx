"use client"

import { useTranslations } from "next-intl"
import { MapPin, Building2, User, Globe, Check, X } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

interface UniversityCardProps {
  university: {
    id: string
    name: string
    abbreviation: string | null
    city: string | null
    wilayaCode: number | null
    departmentName: string | null
    deanName: string | null
    status: string
    createdAt: Date
  }
  onApprove: (id: string) => void
  onReject: (id: string) => void
  isApproving: boolean
  isRejecting: boolean
}

export function UniversityCard({
  university,
  onApprove,
  onReject,
  isApproving,
  isRejecting,
}: UniversityCardProps) {
  const t = useTranslations("dashboard.admin.universities")

  return (
    <Card className="rounded-none border border-border/60 bg-background/40 p-6 shadow-none space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            <h3 className="font-serif text-lg text-heading">
              {university.name}
              {university.abbreviation && (
                <span className="text-muted-foreground ms-1">
                  ({university.abbreviation})
                </span>
              )}
            </h3>
          </div>
        </div>
        <Badge
          className={`shrink-0 px-2 py-1 font-bold uppercase tracking-widest text-[9px] border-none ${
            university.status === "pending"
              ? "bg-amber-500/10 text-amber-600"
              : university.status === "approved"
                ? "bg-emerald-500/10 text-emerald-600"
                : "bg-destructive/10 text-destructive"
          }`}
        >
          {t(`status.${university.status}`)}
        </Badge>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-muted-foreground">
        {university.city && (
          <div className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5" />
            <span>{university.city}</span>
          </div>
        )}
        {university.departmentName && (
          <div className="flex items-center gap-1.5">
            <Globe className="h-3.5 w-3.5" />
            <span>{university.departmentName}</span>
          </div>
        )}
        {university.deanName && (
          <div className="flex items-center gap-1.5">
            <User className="h-3.5 w-3.5" />
            <span>{university.deanName}</span>
          </div>
        )}
      </div>

      {university.status === "pending" && (
        <div className="flex gap-2 pt-2">
          <Button
            type="button"
            variant="editorial"
            size="sm"
            className="h-9 px-4"
            disabled={isApproving}
            onClick={() => onApprove(university.id)}
          >
            <Check className="h-3.5 w-3.5 me-1.5" />
            {t("approve")}
          </Button>
          <Button
            type="button"
            variant="editorial-outline"
            size="sm"
            className="h-9 px-4"
            disabled={isRejecting}
            onClick={() => onReject(university.id)}
          >
            <X className="h-3.5 w-3.5 me-1.5" />
            {t("reject")}
          </Button>
        </div>
      )}
    </Card>
  )
}
