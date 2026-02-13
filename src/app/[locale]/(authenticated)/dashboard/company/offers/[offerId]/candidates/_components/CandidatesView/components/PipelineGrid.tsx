import { useTranslations } from "next-intl"
import { Loader2, Users } from "lucide-react"
import * as motion from "motion/react-client"

import { reveal, ease } from "@/lib/animations"
import { STAGE_COLUMNS, STAGE_LABELS } from "@/lib/constants/pipeline"
import type { PipelineStage } from "@/lib/constants/pipeline"

import { CandidateCard } from "./CandidateCard"

interface Application {
  id: string
  status: string
  pipelineStage: PipelineStage
  createdAt: string | Date
  student: { id: string; name: string | null }
  university: { name: string; abbreviation: string | null } | null
}

interface PipelineGridProps {
  applications: Application[]
  grouped: Map<PipelineStage, Application[]>
  isLoading: boolean
  offerId: string
  actionLoading: string | null
  isStagePending: boolean
  onAccept: (appId: string) => void
  onRefuse: (app: Application) => void
  onStageChange: (appId: string, toStage: PipelineStage) => void
  onViewTimeline: (appId: string) => void
}

export function PipelineGrid({
  applications,
  grouped,
  isLoading,
  offerId,
  actionLoading,
  isStagePending,
  onAccept,
  onRefuse,
  onStageChange,
  onViewTimeline,
}: PipelineGridProps) {
  const t = useTranslations("dashboard.company.candidates")

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (applications.length === 0) {
    return (
      <motion.div
        {...reveal}
        transition={{ duration: 0.6, ease, delay: 0.1 }}
        className="border border-dashed border-border p-12 text-center space-y-2"
      >
        <Users className="h-12 w-12 text-muted-foreground/30 mx-auto" />
        <p className="text-sm text-muted-foreground">{t("empty")}</p>
      </motion.div>
    )
  }

  return (
    <div className="overflow-x-auto pb-2">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6 gap-3 min-w-[1120px]">
        {STAGE_COLUMNS.map((stage) => {
          const stageApps = grouped.get(stage) ?? []
          return (
            <section
              key={stage}
              className="border border-border bg-secondary/10 p-3 space-y-3 min-h-[420px]"
            >
              <header className="flex items-center justify-between">
                <h2 className="text-xs font-semibold tracking-wider uppercase text-heading">
                  {STAGE_LABELS[stage]}
                </h2>
                <span className="text-[10px] text-muted-foreground">
                  {stageApps.length}
                </span>
              </header>
              <div className="space-y-2">
                {stageApps.length === 0 && (
                  <p className="text-[11px] text-muted-foreground">
                    No applications
                  </p>
                )}
                {stageApps.map((app) => (
                  <CandidateCard
                    key={app.id}
                    app={app}
                    offerId={offerId}
                    actionLoading={actionLoading}
                    isStagePending={isStagePending}
                    onAccept={() => onAccept(app.id)}
                    onRefuse={() => onRefuse(app)}
                    onStageChange={(toStage) =>
                      onStageChange(app.id, toStage)
                    }
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
