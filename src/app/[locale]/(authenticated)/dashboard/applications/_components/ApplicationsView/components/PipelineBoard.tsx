"use client"

import { STAGE_COLUMNS, STAGE_LABELS } from "@/lib/constants/pipeline"

import { ApplicationCard } from "@/app/[locale]/(authenticated)/dashboard/applications/_components/ApplicationsView/components/ApplicationCard"

interface PipelineApplication {
  id: string
  offerId: string
  offerTitle: string
  companyName: string
  offerWilayaCode: number | null
  status: string
  createdAt: string | Date
}

interface PipelineBoardProps {
  groupedByStage: Map<string, PipelineApplication[]>
  withdrawingId: string | null
  onWithdraw: (applicationId: string) => void
  onViewTimeline: (applicationId: string) => void
}

export function PipelineBoard({
  groupedByStage,
  withdrawingId,
  onWithdraw,
  onViewTimeline,
}: PipelineBoardProps) {
  return (
    <div className="overflow-x-auto pb-2">
      <div className="grid min-w-[1120px] grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        {STAGE_COLUMNS.map((stage) => {
          const stageApps = groupedByStage.get(stage) ?? []

          return (
            <section
              key={stage}
              className="min-h-[380px] space-y-3 border border-border bg-secondary/10 p-3"
            >
              <header className="flex items-center justify-between">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-heading">
                  {STAGE_LABELS[stage]}
                </h2>
                <span className="text-[10px] text-muted-foreground">{stageApps.length}</span>
              </header>

              <div className="space-y-2">
                {stageApps.length === 0 && (
                  <p className="text-[11px] text-muted-foreground">No applications</p>
                )}
                {stageApps.map((app) => (
                  <ApplicationCard
                    key={app.id}
                    app={app}
                    isWithdrawing={withdrawingId === app.id}
                    onWithdraw={() => onWithdraw(app.id)}
                    onViewTimeline={() => onViewTimeline(app.id)}
                  />
                ))}
              </div>
            </section>
          )
        })}
      </div>
    </div>
  )
}
