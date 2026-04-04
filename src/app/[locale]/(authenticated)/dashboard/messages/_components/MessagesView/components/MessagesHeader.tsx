import * as motion from "motion/react-client"
import { useTranslations } from "next-intl"
import type { MessagesRole } from "@/app/[locale]/(authenticated)/dashboard/messages/_components/MessagesView/types"
import { ease, reveal } from "@/lib/animations"

interface MessagesHeaderProps {
  role: MessagesRole
  threadCount: number
}

export function MessagesHeader({ role, threadCount }: MessagesHeaderProps) {
  const t = useTranslations("dashboard.messages")
  const kicker = role === "student" ? t("kickerStudent") : t("kickerCompany")
  const subtitle =
    role === "student"
      ? t("subtitleStudent")
      : t("subtitleCompany")

  return (
    <motion.div
      {...reveal}
      transition={{ duration: 0.6, ease }}
      className="space-y-0"
    >
      <div className="h-0.5 bg-primary" />
      <div className="border border-t-0 border-border/50 px-6 py-6 sm:px-8 sm:py-8">
        <div className="space-y-2">
          <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-primary">
            {kicker}
          </p>
          <h1 className="font-serif text-[clamp(1.75rem,3.5vw,2.5rem)] leading-[1.08] tracking-tight text-heading">
            {t("title")}
          </h1>
          <p className="text-sm font-light text-muted-foreground">{subtitle}</p>
          <p className="pt-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground/70">
            {t("threadsCount", { count: threadCount })}
          </p>
        </div>
      </div>
    </motion.div>
  )
}
