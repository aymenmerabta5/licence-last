"use client"

import { useTranslations } from "next-intl"
import type { MessagesRole } from "@/app/[locale]/(authenticated)/dashboard/messages/_components/MessagesView/types"

interface MessagesHeaderProps {
  role: MessagesRole
  threadCount: number
}

export function MessagesHeader({ role, threadCount }: MessagesHeaderProps) {
  const t = useTranslations("dashboard.messages")
  const subtitle =
    role === "student" ? t("subtitleStudent") : t("subtitleCompany")

  return (
    <header className="space-y-4">
      <div className="h-0.5 bg-primary" />
      <div className="space-y-3">
        <div className="space-y-2">
          <h1 className="font-serif text-[clamp(1.8rem,3.2vw,2.4rem)] leading-[1.1] tracking-tight text-heading">
            {t("title")}
          </h1>
          <p className="text-sm font-light text-muted-foreground max-w-lg">
            {subtitle}
          </p>
        </div>
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground/70 [[dir=rtl]_&]:tracking-normal">
          {t("threadsCount", { count: threadCount })}
        </p>
      </div>
    </header>
  )
}
