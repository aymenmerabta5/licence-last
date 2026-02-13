"use client"

import * as motion from "motion/react-client"
import { useTranslations } from "next-intl"
import { UsersRound, CheckCircle2, BarChart3, Shield } from "lucide-react"

import { Link } from "@/i18n/routing"
import { reveal, ease } from "@/lib/animations"

const actions = [
  { labelKey: "userManagement", href: "/dashboard/admin/users", icon: UsersRound },
  { labelKey: "validations", href: "/dashboard/admin/validations", icon: CheckCircle2 },
  { labelKey: "statistics", href: "/dashboard/admin/stats", icon: BarChart3 },
] as const

export function QuickActionsGrid() {
  const t = useTranslations("dashboard.superAdmin.commandCenter")

  return (
    <motion.div
      {...reveal}
      transition={{ duration: 0.6, ease, delay: 0.3 }}
      className="space-y-4"
    >
      <div className="flex items-center gap-2">
        <Shield className="h-4 w-4 text-muted-foreground/60" />
        <h2 className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">
          {t("quickActions")}
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {actions.map((action) => {
          const Icon = action.icon
          return (
            <Link
              key={action.labelKey}
              href={action.href as "/dashboard"}
              className="group border border-border/60 bg-white dark:bg-card p-5 flex items-center gap-4 hover:border-primary/30 transition-colors"
            >
              <Icon className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
              <span className="text-sm font-medium text-heading">
                {t(`actions.${action.labelKey}`)}
              </span>
            </Link>
          )
        })}
      </div>
    </motion.div>
  )
}
