"use client"

import { Send, Square } from "lucide-react"
import * as motion from "motion/react-client"
import { useTranslations } from "next-intl"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

interface ConversationComposerProps {
  input: string
  isStreaming: boolean
  canSendMessage: boolean
  errorMessage: string | null
  textareaRef: React.RefObject<HTMLTextAreaElement | null>
  onSubmit: (event: React.FormEvent) => void
  onKeyDown: (event: React.KeyboardEvent<HTMLTextAreaElement>) => void
  onTextareaChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void
  onStop: () => void
}

export function ConversationComposer({
  input,
  isStreaming,
  canSendMessage,
  errorMessage,
  textareaRef,
  onSubmit,
  onKeyDown,
  onTextareaChange,
  onStop,
}: ConversationComposerProps) {
  const t = useTranslations("dashboard.assistant")

  return (
    <form onSubmit={onSubmit} className="mt-4 space-y-3">
      <div className="relative">
        <Textarea
          ref={textareaRef}
          value={input}
          onChange={onTextareaChange}
          onKeyDown={onKeyDown}
          placeholder={t("inputPlaceholder")}
          disabled={isStreaming}
          className={cn(
            "rounded-none min-h-[56px] max-h-[200px] bg-background/60 resize-none",
            "pe-14 pb-8",
            "focus-visible:ring-1 focus-visible:ring-primary/30",
          )}
          rows={1}
        />

        <div className="absolute end-2 bottom-2">
          {isStreaming ? (
            <Button
              type="button"
              variant="destructive"
              size="icon-sm"
              onClick={onStop}
              aria-label={t("stop")}
            >
              <Square className="h-3.5 w-3.5" />
            </Button>
          ) : (
            <Button
              type="submit"
              variant="default"
              size="icon-sm"
              disabled={!canSendMessage}
              aria-label={t("send")}
            >
              <Send className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>

        <p className="absolute start-3 bottom-2 text-[10px] text-muted-foreground/70">
          {t("enterToSend")}
        </p>
      </div>

      {errorMessage && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-xs text-destructive"
        >
          {errorMessage}
        </motion.p>
      )}
    </form>
  )
}
