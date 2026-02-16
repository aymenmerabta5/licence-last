"use client"

import * as motion from "motion/react-client"
import { useTranslations } from "next-intl"
import { Plus, Briefcase, Building2, Bot, ArrowRight } from "lucide-react"
import { Link } from "@/i18n/routing"
import { cn } from "@/lib/utils"
import { ease } from "@/lib/animations"
import type { Route } from "next"
import type { LucideIcon } from "lucide-react"

interface ActionItem {
  title: string
  description: string
  href: string
  icon: LucideIcon
  accent: string
  accentHover: string
  primary?: boolean
}

export function RecruiterQuickActions() {
  const t = useTranslations("dashboard.recruiter")

  const actions: ActionItem[] = [
    {
      title: t("actions.postOffer"),
      description: "Publish a new internship position",
      href: "/dashboard/company/offers/new",
      icon: Plus,
      accent: "text-white bg-primary",
      accentHover: "group-hover:bg-primary/90",
      primary: true,
    },
    {
      title: t("actions.manageOffers"),
      description: "Edit or close existing offers",
      href: "/dashboard/company/offers",
      icon: Briefcase,
      accent: "text-violet-500 bg-violet-500/5",
      accentHover: "group-hover:bg-violet-500 group-hover:text-white",
    },
    {
      title: "Company Profile",
      description: "Update your company information",
      href: "/dashboard/company/profile",
      icon: Building2,
      accent: "text-amber-500 bg-amber-500/5",
      accentHover: "group-hover:bg-amber-500 group-hover:text-white",
    },
    {
      title: "AI Assistant",
      description: "Get help with recruiting",
      href: "/dashboard/assistant",
      icon: Bot,
      accent: "text-teal-500 bg-teal-500/5",
      accentHover: "group-hover:bg-teal-500 group-hover:text-white",
    },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.4, ease }}
      className="space-y-5"
    >
      <h2 className="font-serif text-xl font-bold text-heading tracking-tight">
        Quick Actions
      </h2>

      <div className="grid grid-cols-1 gap-2.5">
        {actions.map((action, i) => {
          const Icon = action.icon
          return (
            <Link key={i} href={action.href as Route}>
              <div
                className={cn(
                  "group flex items-center gap-4 p-4 sm:p-5 transition-all duration-300 cursor-pointer",
                  action.primary
                    ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
                    : "border border-border/40 bg-background hover:border-border/60 hover:shadow-sm",
                )}
              >
                <div
                  className={cn(
                    "p-2.5 shrink-0 transition-all duration-300",
                    action.primary
                      ? "bg-white/20"
                      : `${action.accent} ${action.accentHover}`,
                  )}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3
                    className={cn(
                      "font-bold text-sm tracking-tight",
                      !action.primary && "text-heading",
                    )}
                  >
                    {action.title}
                  </h3>
                  <p
                    className={cn(
                      "text-[11px] mt-0.5 truncate",
                      action.primary
                        ? "opacity-70"
                        : "text-muted-foreground",
                    )}
                  >
                    {action.description}
                  </p>
                </div>
                <ArrowRight
                  className={cn(
                    "h-3.5 w-3.5 shrink-0 transition-all [[dir=rtl]_&]:rotate-180",
                    action.primary
                      ? "opacity-50 group-hover:opacity-100 group-hover:translate-x-1 [[dir=rtl]_&]:group-hover:-translate-x-1"
                      : "text-muted-foreground/30 group-hover:text-primary group-hover:translate-x-1 [[dir=rtl]_&]:group-hover:-translate-x-1",
                  )}
                />
              </div>
            </Link>
          )
        })}
      </div>
    </motion.div>
  )
}
