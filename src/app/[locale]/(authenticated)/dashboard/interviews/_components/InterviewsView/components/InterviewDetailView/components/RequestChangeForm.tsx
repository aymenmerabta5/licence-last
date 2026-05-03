"use client"

import { ChevronDown, Send } from "lucide-react"
import * as motion from "motion/react-client"
import { useTranslations } from "next-intl"
import { useRequestChangeForm } from "@/app/[locale]/(authenticated)/dashboard/interviews/_components/InterviewsView/components/InterviewDetailView/hooks/useRequestChangeForm"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ease, reveal } from "@/lib/animations"
import { cn } from "@/lib/utils"

interface RequestChangeFormProps {
  offerId: string
  companyName: string
}

export function RequestChangeForm({
  offerId,
  companyName,
}: RequestChangeFormProps) {
  const t = useTranslations("dashboard.interviews.detail")
  const form = useRequestChangeForm({ offerId, companyName })

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={() => form.setIsExpanded(!form.isExpanded)}
        aria-expanded={form.isExpanded}
        aria-controls="request-change-panel"
        className="flex items-center gap-2 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <span>{t("requestChangeTitle")}</span>
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 transition-transform",
            form.isExpanded && "rotate-180",
          )}
          aria-hidden="true"
        />
      </button>

      {form.isExpanded && (
        <motion.div
          id="request-change-panel"
          {...reveal}
          transition={{ duration: 0.4, ease }}
          className="space-y-3"
        >
          <p className="text-xs text-muted-foreground">
            {t("requestChangeDescription", { companyName })}
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              form.submit()
            }}
            className="space-y-3"
          >
            <Textarea
              value={form.body}
              onChange={(e) => form.setBody(e.target.value)}
              placeholder={t("requestChangePlaceholder")}
              rows={3}
              className="resize-none text-sm"
            />
            <div className="flex justify-end">
              <Button
                type="submit"
                variant="editorial"
                size="sm"
                disabled={form.isSubmitting || !form.body.trim()}
                className="gap-1.5"
              >
                <Send className="h-3 w-3" aria-hidden="true" />
                {t("requestChangeSubmit")}
              </Button>
            </div>
          </form>
        </motion.div>
      )}
    </div>
  )
}
