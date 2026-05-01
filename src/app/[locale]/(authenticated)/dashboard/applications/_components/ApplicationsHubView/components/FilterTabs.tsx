"use client"

import { useTranslations } from "next-intl"
import { cn } from "@/lib/utils"

export type FilterTab = "all" | "action_required" | "in_progress" | "finalized"

interface FilterTabsProps {
  active: FilterTab
  onChange: (filter: FilterTab) => void
}

const tabs: { key: FilterTab; labelKey: string }[] = [
  { key: "all", labelKey: "filters.all" },
  { key: "action_required", labelKey: "filters.actionRequired" },
  { key: "in_progress", labelKey: "filters.inProgress" },
  { key: "finalized", labelKey: "filters.finalized" },
]

/**
 * Filter logic (handled by the useApplicationHub hook):
 * - all: everything
 * - action_required: has pending interview slot OR placement with pending docs
 * - in_progress: pipelineStage in ["applied", "screening", "interview", "offer"]
 * - finalized: pipelineStage in ["accepted", "rejected"] or status === "withdrawn"
 */
export function FilterTabs({ active, onChange }: FilterTabsProps) {
  const t = useTranslations("dashboard.applications.hub")

  return (
    <div className="flex flex-wrap gap-2">
      {tabs.map((tab) => {
        const isActive = active === tab.key
        return (
          <button
            key={tab.key}
            type="button"
            onClick={() => onChange(tab.key)}
            className={cn(
              "border px-4 py-2 text-xs font-bold uppercase tracking-[0.15em] transition-colors",
              isActive
                ? "border-foreground bg-foreground text-background"
                : "border-border text-muted-foreground hover:border-foreground hover:text-foreground",
            )}
          >
            {t(tab.labelKey)}
          </button>
        )
      })}
    </div>
  )
}
