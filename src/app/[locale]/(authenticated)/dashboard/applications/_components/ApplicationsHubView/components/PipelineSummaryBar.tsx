"use client"

import * as motion from "motion/react-client"
import { useTranslations } from "next-intl"
import { STAGE_COLUMNS } from "@/lib/constants/pipeline"
import { reveal, revealWithDelay } from "@/lib/animations"
import { cn } from "@/lib/utils"

interface PipelineSummaryBarProps {
  counts: Record<string, number>
  activeStage: string | null
  onStageClick: (stage: string | null) => void
}

export function PipelineSummaryBar({ counts, activeStage, onStageClick }: PipelineSummaryBarProps) {
  const t = useTranslations("dashboard.applications.hub")

  return (
    <motion.div
      {...reveal}
      transition={revealWithDelay(0.1)}
      className="grid grid-cols-2 border border-border/80 bg-background shadow-[4px_4px_0_0_oklch(var(--border))] md:grid-cols-3 lg:grid-cols-6"
    >
      {STAGE_COLUMNS.map((stage, index) => {
        const isActive = activeStage === stage
        return (
          <button
            key={stage}
            type="button"
            onClick={() => onStageClick(isActive ? null : stage)}
            className={cn(
              "relative flex flex-col items-center gap-2 border-border/50 px-4 py-5 text-center transition-colors duration-500 sm:items-start sm:text-start md:px-5 md:py-6",
              "hover:bg-foreground hover:text-background",
              index < STAGE_COLUMNS.length - 1 && "border-e",
              index < STAGE_COLUMNS.length - 1 && index % 2 === 1 && "max-md:border-none",
              "border-b md:border-b-0",
              index >= STAGE_COLUMNS.length - 2 && "max-md:border-b-0",
              isActive && "border-b-2 border-b-primary bg-foreground/5 dark:bg-foreground/10",
            )}
          >
            <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-foreground/50">
              {t(`pipeline.${stage}`)}
            </span>
            <span className="font-serif text-2xl leading-none text-foreground md:text-3xl">
              {counts[stage] ?? 0}
            </span>
          </button>
        )
      })}
    </motion.div>
  )
}
