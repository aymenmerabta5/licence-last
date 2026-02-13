"use client"

import { useTranslations } from "next-intl"
import { Sparkles, Wand2, Tag } from "lucide-react"
import * as motion from "motion/react-client"

import { reveal, ease } from "@/lib/animations"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"

import type { OfferCopilotIntent } from "../types"

interface CopilotPanelProps {
  aiPrompt: string
  onAiPromptChange: (value: string) => void
  aiIntent: OfferCopilotIntent | null
  aiStatus: string
  aiError: Error | undefined
  previewOutput: unknown
  onSendIntent: (intent: OfferCopilotIntent, text: string) => void
  onApply: () => void
}

export function CopilotPanel({
  aiPrompt,
  onAiPromptChange,
  aiIntent,
  aiStatus,
  aiError,
  previewOutput,
  onSendIntent,
  onApply,
}: CopilotPanelProps) {
  const t = useTranslations("dashboard.company.offers.form")

  return (
    <motion.div
      {...reveal}
      transition={{ duration: 0.6, ease, delay: 0.08 }}
      className="border border-border bg-primary/5 p-4 sm:p-5 rounded-none space-y-4"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-[10px] font-semibold tracking-[0.15em] uppercase text-muted-foreground/70">
            {t("copilot.title")}
          </p>
          <p className="text-sm text-muted-foreground font-light">
            {t("copilot.description")}
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-muted-foreground">
          <Sparkles className="h-4 w-4" />
          <span className="text-xs tracking-wide">{t("copilot.badge")}</span>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-[1fr,auto]">
        <div className="space-y-2">
          <Label
            htmlFor="offer-ai-prompt"
            className="text-[11px] font-medium tracking-[0.1em] uppercase text-muted-foreground"
          >
            {t("copilot.promptLabel")}
          </Label>
          <InputGroup className="rounded-none h-11">
            <InputGroupAddon align="inline-start">
              <Wand2 className="h-4 w-4" />
            </InputGroupAddon>
            <InputGroupInput
              id="offer-ai-prompt"
              type="text"
              value={aiPrompt}
              onChange={(e) => onAiPromptChange(e.target.value)}
              placeholder={t("copilot.promptPlaceholder")}
            />
          </InputGroup>
        </div>

        <Button
          type="button"
          variant="editorial"
          size="editorial"
          className="h-11 mt-[26px]"
          disabled={aiStatus !== "ready"}
          onClick={() =>
            onSendIntent(
              "offer_generate_draft",
              aiPrompt.trim() || t("copilot.prompts.generateDraft"),
            )
          }
        >
          {t("copilot.generateDraft")}
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          disabled={aiStatus !== "ready"}
          onClick={() =>
            onSendIntent(
              "offer_improve_description",
              t("copilot.prompts.improveDescription"),
            )
          }
        >
          {t("copilot.improveDescription")}
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={aiStatus !== "ready"}
          onClick={() =>
            onSendIntent(
              "offer_suggest_skill_tags",
              t("copilot.prompts.suggestSkills"),
            )
          }
        >
          <Tag className="h-4 w-4" />
          {t("copilot.suggestSkills")}
        </Button>
        <p className="text-[11px] text-muted-foreground self-center">
          {t("copilot.status", { status: aiStatus })}
        </p>
      </div>

      {aiError && (
        <p className="text-[11px] text-destructive">{aiError.message}</p>
      )}

      {aiIntent && (
        <div className="border border-border bg-background/60 p-4 rounded-none space-y-3">
          <div className="flex items-center justify-between gap-3">
            <p className="text-[10px] font-semibold tracking-[0.15em] uppercase text-muted-foreground/70">
              {t("copilot.preview")}
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={aiStatus !== "ready"}
              onClick={onApply}
            >
              {t("copilot.applyToForm")}
            </Button>
          </div>

          {!previewOutput ? (
            <p className="text-xs text-muted-foreground">
              {t("copilot.waiting")}
            </p>
          ) : (
            <pre className="text-xs rounded-md border border-border/60 bg-muted/20 p-3 overflow-x-auto">
              {JSON.stringify(previewOutput, null, 2)}
            </pre>
          )}
        </div>
      )}
    </motion.div>
  )
}
