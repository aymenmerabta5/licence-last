"use client"

import { Loader2, NotebookPen, Pencil, Plus } from "lucide-react"
import { useTranslations } from "next-intl"
import { useState } from "react"
import { RenameConversationDialog } from "@/app/[locale]/(authenticated)/dashboard/assistant/_components/AssistantChat/components/RenameConversationDialog"
import { formatConversationTitle } from "@/app/[locale]/(authenticated)/dashboard/assistant/_components/AssistantChat/utils"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface Model {
  id: string
  label: string
}

interface ChatHeaderProps {
  conversationTitle?: string | null
  isGeneratingTitle?: boolean
  models: Model[]
  activeModel: string | null
  onUpdateModel: (modelId: string) => void
  onUpdateTitle: (title: string | null) => void
  onOpenNoteDialog: () => void
  onCreateConversation: () => void
}

export function ChatHeader({
  conversationTitle,
  isGeneratingTitle,
  models,
  activeModel,
  onUpdateModel,
  onUpdateTitle,
  onOpenNoteDialog,
  onCreateConversation,
}: ChatHeaderProps) {
  const t = useTranslations("dashboard.assistant")
  const [isRenameOpen, setIsRenameOpen] = useState(false)

  return (
    <div className="border-b border-border/60 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shrink-0">
      <div className="min-w-0">
        <p className="text-[10px] font-semibold tracking-[0.18em] uppercase text-muted-foreground">
          {t("conversation")}
        </p>
        <p className="mt-1 text-sm text-foreground truncate">
          {isGeneratingTitle ? (
            <span className="inline-flex items-center gap-1.5 text-muted-foreground">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              {t("generatingTitle")}
            </span>
          ) : (
            formatConversationTitle(conversationTitle)
          )}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-2">
          <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
            {t("model")}
          </p>
          <Select
            value={activeModel ?? ""}
            onValueChange={(val) => {
              if (val) onUpdateModel(val)
            }}
            items={models.map((m) => ({ value: m.id, label: m.label }))}
          >
            <SelectTrigger size="sm" className="rounded-none">
              <SelectValue placeholder={t("selectModel")} />
            </SelectTrigger>
            <SelectContent align="end">
              {models.map((m) => (
                <SelectItem key={m.id} value={m.id}>
                  {m.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button
          type="button"
          variant="editorial-ghost"
          size="editorial-sm"
          className="gap-2"
          onClick={() => setIsRenameOpen(true)}
        >
          <Pencil className="h-4 w-4" />
          {t("renameConversation")}
        </Button>

        <RenameConversationDialog
          open={isRenameOpen}
          onOpenChange={setIsRenameOpen}
          currentTitle={formatConversationTitle(conversationTitle)}
          onSave={onUpdateTitle}
        />

        <Button
          type="button"
          variant="editorial-ghost"
          size="editorial-sm"
          className="gap-2"
          onClick={onOpenNoteDialog}
        >
          <NotebookPen className="h-4 w-4" />
          {t("saveNote")}
        </Button>

        <Button
          type="button"
          variant="editorial-ghost"
          size="editorial-sm"
          className="gap-2"
          onClick={onCreateConversation}
        >
          <Plus className="h-4 w-4" />
          {t("newConversation")}
        </Button>
      </div>
    </div>
  )
}
