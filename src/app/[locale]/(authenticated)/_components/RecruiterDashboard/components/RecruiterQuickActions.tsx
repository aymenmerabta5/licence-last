"use client"

import type { LucideIcon } from "lucide-react"
import {
  ArrowRight,
  Bot,
  Briefcase,
  FileText,
  Plus,
  UsersRound,
} from "lucide-react"
import * as motion from "motion/react-client"
import type { Route } from "next"
import { useTranslations } from "next-intl"
import { Link } from "@/i18n/routing"
import { ease, reveal } from "@/lib/animations"
import { cn } from "@/lib/utils"

interface ActionItem {
  title: string
  description: string
  href: string
  icon: LucideIcon
  primary?: boolean
}

export function RecruiterQuickActions({
  assistantEnabled,
}: {
  assistantEnabled: boolean
}) {
  const t = useTranslations("dashboard.recruiter")
  const tNav = useTranslations("dashboard.nav")

  const actions: ActionItem[] = [
    {
      title: t("actions.postOffer"),
      description: "Publish a new position",
      href: "/dashboard/company/offers/new",
      icon: Plus,
      primary: true,
    },
    {
      title: t("actions.manageOffers"),
      description: "Edit or close listings",
      href: "/dashboard/company/offers",
      icon: Briefcase,
    },
    {
      title: t("actions.reviewCandidates"),
      description: "Review applicant pipeline",
      href: "/dashboard/candidates",
      icon: UsersRound,
    },
    {
      title: tNav("companyDocuments"),
      description: "Generate and download records",
      href: "/dashboard/company/documents",
      icon: FileText,
    },
  ]

  if (assistantEnabled) {
    actions.push({
      title: "AI Assistant",
      description: "Recruiting help",
      href: "/dashboard/assistant",
      icon: Bot,
    })
  }

  return (
    <motion.div
      {...reveal}
      transition={{ duration: 0.6, delay: 0.4, ease }}
      className="space-y-8 relative"
    >
      <div className="flex items-end justify-between border-b-4 border-foreground pb-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/70 mb-2 block">
            Shortcuts
          </span>
          <h2 className="font-serif text-3xl font-normal text-foreground tracking-tighter">
            Quick Actions<span className="text-primary/40 leading-none">.</span>
          </h2>
        </div>
      </div>

      <div className="flex flex-col border border-border/80 bg-background divide-y divide-border/60 shadow-[4px_4px_0_0_oklch(var(--border)_/_0.3)]">
        {actions.map((action, i) => {
          const Icon = action.icon
          return (
            <Link key={i} href={action.href as Route} prefetch={false}>
              <div
                className={cn(
                  "group relative overflow-hidden flex items-center justify-between p-5 md:p-6 transition-colors duration-300",
                  action.primary
                    ? "bg-primary text-primary-foreground hover:bg-foreground hover:text-background"
                    : "bg-background text-foreground hover:bg-foreground hover:text-background",
                )}
              >
                {action.primary && (
                  <div className="absolute inset-x-0 bottom-0 h-1 bg-background/20 scale-x-0 origin-left group-hover:scale-x-100 transition-transform duration-500 ease-in-out" />
                )}

                <div className="flex items-center gap-6 relative z-10 w-full">
                  <div
                    className={cn(
                      "p-3 flex items-center justify-center shrink-0 transition-colors border-2",
                      action.primary
                        ? "bg-background text-foreground border-background group-hover:border-background group-hover:text-background"
                        : "bg-foreground text-background border-foreground group-hover:bg-background group-hover:text-foreground group-hover:border-background",
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-serif text-xl md:text-2xl font-normal tracking-tight mb-1">
                      {action.title}
                    </h3>
                    <p
                      className={cn(
                        "text-[10px] font-bold uppercase tracking-[0.15em]",
                        action.primary
                          ? "text-primary-foreground/70 group-hover:text-background/50"
                          : "text-foreground/50 group-hover:text-background/50",
                      )}
                    >
                      {action.description}
                    </p>
                  </div>
                  <ArrowRight
                    className={cn(
                      "h-5 w-5 shrink-0 opacity-0 -translate-x-4 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0 [[dir=rtl]_&]:rotate-180",
                      action.primary ? "text-background" : "text-background",
                    )}
                  />
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </motion.div>
  )
}
