"use client"

import { NotebookPen } from "lucide-react"
import { useTranslations } from "next-intl"

interface NoteBubbleProps {
  textContent: string
  relativeTimestamp: string | null
}

export function NoteBubble({
  textContent,
  relativeTimestamp,
}: NoteBubbleProps) {
  const t = useTranslations("dashboard.assistant")

  return (
    <div className="group flex justify-center px-2 py-1">
      <div className="relative w-full max-w-[88%] sm:max-w-[72%]">
        {/* Decorative top bar */}
        <div className="absolute -top-px start-0 end-0 h-[2px] bg-gradient-to-r from-primary/60 via-primary/30 to-transparent" />

        <div className="border border-border/50 bg-card/80 px-5 py-4">
          {/* Header row */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <NotebookPen className="h-3.5 w-3.5 text-primary shrink-0" />
              <span className="text-[9px] font-bold tracking-[0.2em] uppercase text-primary">
                {t("noteLabel")}
              </span>
            </div>
            {relativeTimestamp && (
              <span className="text-[10px] text-muted-foreground/50 opacity-0 group-hover:opacity-100 transition-opacity">
                {relativeTimestamp}
              </span>
            )}
          </div>

          {/* Note text */}
          <p className="text-sm leading-relaxed text-foreground/80 italic font-serif">
            {textContent}
          </p>
        </div>
      </div>
    </div>
  )
}
