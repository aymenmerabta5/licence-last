import { Building, Calendar, ChevronRight } from "lucide-react"
import { useLocale } from "next-intl"
import { StatusBadge } from "@/app/[locale]/(authenticated)/_components/StudentDashboard/components/StatusBadge"
import type { ApplicationRow } from "@/app/[locale]/(authenticated)/_components/StudentDashboard/types"
import { relativeTime } from "@/app/[locale]/(authenticated)/_components/StudentDashboard/utils"
import { getWilayaName } from "@/lib/wilayas"

interface ApplicationCardProps {
  application: ApplicationRow
  index: number
}

export function ApplicationCard({
  application: app,
  index,
}: ApplicationCardProps) {
  const locale = useLocale()

  return (
    <div className="group relative w-full flex flex-col md:flex-row transition-all duration-500 hover:bg-foreground hover:text-background cursor-pointer overflow-hidden p-5 md:p-6 gap-6 md:gap-0">
      {/* Background slide animation effect */}
      <div className="absolute inset-0 bg-primary/10 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-[600ms] ease-[cubic-bezier(0.22,1,0.36,1)] z-0" />

      {/* Number identifier for list */}
      <div className="relative z-10 w-12 hidden md:flex items-start justify-start font-serif italic text-2xl opacity-40 group-hover:opacity-100 group-hover:text-primary transition-colors">
        {(index + 1).toString().padStart(2, "0")}
      </div>

      {/* Main Content Info */}
      <div className="relative z-10 flex-1 flex flex-col justify-start">
        <div className="flex items-center gap-2 mb-2">
          <Building className="h-3.5 w-3.5 text-primary group-hover:text-background" />
          <span className="text-[10px] font-bold text-primary group-hover:text-background uppercase tracking-[0.1em] [[dir=rtl]_&]:tracking-normal">
            {app.companyName}
          </span>

          {app.offerWilayaCode && (
            <>
              <span className="h-3 w-px bg-border group-hover:bg-background/20 mx-1" />
              <span className="text-[9px] text-foreground/50 group-hover:text-background/50 flex items-center font-bold tracking-widest uppercase">
                {getWilayaName(app.offerWilayaCode)}
              </span>
            </>
          )}
        </div>

        <h3 className="text-xl md:text-2xl font-serif font-normal leading-none group-hover:text-background transition-colors tracking-tight">
          {app.offerTitle}
        </h3>
      </div>

      {/* Status & Timing */}
      <div className="relative z-10 flex flex-row md:flex-col items-center justify-between md:items-end md:justify-center md:w-48 shrink-0">
        <div className="scale-90 md:scale-100 origin-left md:origin-right mb-0 md:mb-3">
          <StatusBadge status={app.status} />
        </div>
        <div className="text-[9px] text-foreground/40 group-hover:text-background/50 flex items-center gap-1.5 uppercase tracking-widest font-bold">
          <Calendar className="h-3 w-3" />
          {relativeTime(app.createdAt, locale)}
        </div>
      </div>

      {/* Hover Arrow */}
      <div className="relative z-10 hidden md:flex w-10 items-center justify-end text-border group-hover:text-primary transition-colors">
        <ChevronRight className="h-5 w-5 opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 transition-all duration-500 delay-100" />
      </div>
    </div>
  )
}
