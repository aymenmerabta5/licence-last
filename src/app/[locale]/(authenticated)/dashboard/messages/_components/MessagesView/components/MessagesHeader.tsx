import * as motion from "motion/react-client"

import { ease, reveal } from "@/lib/animations"

import type { MessagesRole } from "@/app/[locale]/(authenticated)/dashboard/messages/_components/MessagesView/types"

interface MessagesHeaderProps {
  role: MessagesRole
  threadCount: number
}

function pluralizeThread(count: number): string {
  return `${count} thread${count === 1 ? "" : "s"}`
}

export function MessagesHeader({ role, threadCount }: MessagesHeaderProps) {
  const kicker = role === "student" ? "Student Inbox" : "Company Inbox"
  const subtitle =
    role === "student"
      ? "Discuss offers with companies you already applied to."
      : "Stay in touch with applicants from your offers."

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
            Messages
          </h1>
          <p className="text-sm font-light text-muted-foreground">
            {subtitle}
          </p>
          <p className="pt-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground/70">
            {pluralizeThread(threadCount)}
          </p>
        </div>
      </div>
    </motion.div>
  )
}
