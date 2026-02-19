import {
  Briefcase,
  CheckCircle2,
  Clock,
  Laptop,
  MapPin,
  Users,
} from "lucide-react"
import * as motion from "motion/react-client"

import { CopilotSkillChips } from "@/app/[locale]/(authenticated)/dashboard/company/offers/_components/OfferForm/components/CopilotSkillChips"
import type { CopilotResult } from "@/app/[locale]/(authenticated)/dashboard/company/offers/_components/OfferForm/types"
import { Button } from "@/components/ui/button"
import { ease } from "@/lib/animations"
import { INTERNSHIP_TYPE_LABELS } from "@/lib/constants/internship"
import { getWilayaName } from "@/lib/wilayas"

const WORK_MODE_LABELS: Record<string, string> = {
  on_site: "On-site",
  hybrid: "Hybrid",
  remote: "Remote",
}

interface CopilotResultPreviewProps {
  result: CopilotResult
  onApply: () => void
  skillMap: Map<string, string>
  t: (key: string, values?: Record<string, string | number>) => string
}

export function CopilotResultPreview({
  result,
  onApply,
  skillMap,
  t,
}: CopilotResultPreviewProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease }}
      className="space-y-3 border-t border-border/40 pt-4"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 className="h-3.5 w-3.5" />
          <span className="text-[10px] font-semibold tracking-[0.1em] uppercase [[dir=rtl]_&]:tracking-normal">
            {t("copilot.appliedToForm")}
          </span>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-7 text-[10px]"
          onClick={onApply}
        >
          {t("copilot.applyToForm")}
        </Button>
      </div>

      {result.intent === "offer_generate_draft" && (
        <div className="space-y-3">
          {result.title && (
            <div>
              <p className="mb-1 text-[9px] font-bold tracking-[0.15em] uppercase text-muted-foreground/40 [[dir=rtl]_&]:tracking-normal">
                {t("copilot.previewTitle")}
              </p>
              <p className="font-serif text-lg text-heading">{result.title}</p>
            </div>
          )}

          {result.description && (
            <div>
              <p className="mb-1 text-[9px] font-bold tracking-[0.15em] uppercase text-muted-foreground/40 [[dir=rtl]_&]:tracking-normal">
                {t("copilot.previewDescription")}
              </p>
              <p className="line-clamp-4 text-sm leading-relaxed text-muted-foreground">
                {result.description}
              </p>
            </div>
          )}

          {(result.internshipType ||
            result.workMode ||
            result.wilayaCode ||
            result.durationWeeks ||
            result.maxPositions) && (
            <div>
              <p className="mb-2 text-[9px] font-bold tracking-[0.15em] uppercase text-muted-foreground/40 [[dir=rtl]_&]:tracking-normal">
                {t("copilot.previewDetails")}
              </p>
              <div className="flex flex-wrap gap-2">
                {result.internshipType && (
                  <span className="inline-flex items-center gap-1.5 border border-purple-500/20 bg-purple-500/5 px-2.5 py-1 text-[10px] font-semibold tracking-wider text-purple-700 uppercase [[dir=rtl]_&]:tracking-normal dark:text-purple-400">
                    <Briefcase className="h-3 w-3" />
                    {INTERNSHIP_TYPE_LABELS[result.internshipType] ??
                      result.internshipType}
                  </span>
                )}

                {result.workMode && (
                  <span className="inline-flex items-center gap-1.5 border border-emerald-500/20 bg-emerald-500/5 px-2.5 py-1 text-[10px] font-semibold tracking-wider text-emerald-700 uppercase [[dir=rtl]_&]:tracking-normal dark:text-emerald-400">
                    <Laptop className="h-3 w-3" />
                    {WORK_MODE_LABELS[result.workMode] ?? result.workMode}
                  </span>
                )}

                {result.wilayaCode && (
                  <span className="inline-flex items-center gap-1.5 border border-blue-500/20 bg-blue-500/5 px-2.5 py-1 text-[10px] font-semibold tracking-wider text-blue-700 uppercase [[dir=rtl]_&]:tracking-normal dark:text-blue-400">
                    <MapPin className="h-3 w-3" />
                    {getWilayaName(result.wilayaCode) ??
                      String(result.wilayaCode).padStart(2, "0")}
                  </span>
                )}

                {result.durationWeeks && (
                  <span className="inline-flex items-center gap-1.5 border border-foreground/10 bg-foreground/5 px-2.5 py-1 text-[10px] font-semibold tracking-wider text-heading uppercase [[dir=rtl]_&]:tracking-normal">
                    <Clock className="h-3 w-3 text-muted-foreground/50" />
                    {t("copilot.duration", { weeks: result.durationWeeks })}
                  </span>
                )}

                {result.maxPositions && (
                  <span className="inline-flex items-center gap-1.5 border border-foreground/10 bg-foreground/5 px-2.5 py-1 text-[10px] font-semibold tracking-wider text-heading uppercase [[dir=rtl]_&]:tracking-normal">
                    <Users className="h-3 w-3 text-muted-foreground/50" />
                    {t("copilot.positions", { count: result.maxPositions })}
                  </span>
                )}
              </div>
            </div>
          )}

          <CopilotSkillChips
            skillTagIds={result.skillTagIds}
            skillTagNames={result.skillTagNames}
            skillMap={skillMap}
            label={t("copilot.previewSkills")}
          />
        </div>
      )}

      {result.intent === "offer_improve_description" && result.description && (
        <div>
          <p className="mb-1 text-[9px] font-bold tracking-[0.15em] uppercase text-muted-foreground/40 [[dir=rtl]_&]:tracking-normal">
            {t("copilot.previewDescription")}
          </p>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {result.description}
          </p>
        </div>
      )}

      {result.intent === "offer_suggest_skill_tags" && (
        <CopilotSkillChips
          skillTagIds={result.skillTagIds}
          skillTagNames={result.skillTagNames}
          skillMap={skillMap}
          label={t("copilot.previewSkills")}
        />
      )}
    </motion.div>
  )
}
