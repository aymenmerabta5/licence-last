import { MapPin, Calendar } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"

import type { ApplicationRow } from "../types"
import { relativeTime } from "../utils"
import { StatusBadge } from "./StatusBadge"
import { getWilayaName } from "@/lib/wilayas"

interface ApplicationCardProps {
  application: ApplicationRow
}

export function ApplicationCard({ application: app }: ApplicationCardProps) {
  return (
    <Card className="group hover:ring-1 hover:ring-primary/20 transition-all cursor-pointer border-border/50 bg-background hover:bg-secondary/5 shadow-sm">
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-serif font-bold text-primary">
                {app.companyName}
              </span>
              <span className="h-1 w-1 rounded-full bg-border" />
              {app.offerWilayaCode && (
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <MapPin className="h-3 w-3" />{" "}
                  {getWilayaName(app.offerWilayaCode)}
                </span>
              )}
            </div>
            <h3 className="text-lg font-bold leading-tight group-hover:text-primary transition-colors">
              {app.offerTitle}
            </h3>
          </div>
          <div className="flex flex-col items-start sm:items-end justify-between gap-3 shrink-0">
            <StatusBadge status={app.status} />
            <span className="text-[10px] text-muted-foreground flex items-center gap-1.5 uppercase tracking-wider font-medium">
              <Calendar className="h-3.5 w-3.5" />{" "}
              {relativeTime(app.createdAt)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
