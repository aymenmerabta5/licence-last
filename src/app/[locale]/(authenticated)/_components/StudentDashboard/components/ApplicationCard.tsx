import { MapPin, Calendar } from "lucide-react"
import { useLocale } from "next-intl"

import type { ApplicationRow } from "@/app/[locale]/(authenticated)/_components/StudentDashboard/types"
import { relativeTime } from "@/app/[locale]/(authenticated)/_components/StudentDashboard/utils"
import { StatusBadge } from "@/app/[locale]/(authenticated)/_components/StudentDashboard/components/StatusBadge"
import { getWilayaName } from "@/lib/wilayas"

interface ApplicationCardProps {
  application: ApplicationRow
}

export function ApplicationCard({ application: app }: ApplicationCardProps) {
  const locale = useLocale()

  return (
    <div className="group py-5 first:pt-0 last:pb-0 cursor-pointer hover:bg-secondary/5 transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-primary uppercase tracking-[0.1em] [[dir=rtl]_&]:tracking-normal">
              {app.companyName}
            </span>
            {app.offerWilayaCode && (
              <>
                <span className="h-0.5 w-0.5 rounded-full bg-muted-foreground/30" />
                <span className="text-[10px] text-muted-foreground/50 flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {getWilayaName(app.offerWilayaCode)}
                </span>
              </>
            )}
          </div>
          <h3 className="text-base font-bold leading-tight text-heading group-hover:text-primary transition-colors">
            {app.offerTitle}
          </h3>
        </div>
        <div className="flex flex-col items-start sm:items-end justify-between gap-2 shrink-0">
          <StatusBadge status={app.status} />
          <span className="text-[9px] text-muted-foreground/40 flex items-center gap-1.5 uppercase tracking-wider font-medium">
            <Calendar className="h-3 w-3" />
            {relativeTime(app.createdAt, locale)}
          </span>
        </div>
      </div>
    </div>
  )
}
