"use client"

import * as motion from "motion/react-client"
import { useTranslations } from "next-intl"
import { Users, ShieldOff, UserCheck, Activity } from "lucide-react"

import { reveal, ease } from "@/lib/animations"

interface PlatformHealthCardsProps {
  totalUsers: number
  bannedUsers: number
  isLoading: boolean
}

const cards = [
  { key: "totalUsers", icon: Users, valueKey: "totalUsers" as const },
  { key: "activeUsers", icon: UserCheck, valueKey: "totalUsers" as const },
  { key: "bannedUsers", icon: ShieldOff, valueKey: "bannedUsers" as const },
  { key: "platformHealth", icon: Activity, valueKey: null },
] as const

export function PlatformHealthCards({ totalUsers, bannedUsers, isLoading }: PlatformHealthCardsProps) {
  const t = useTranslations("dashboard.superAdmin.commandCenter")

  const values = {
    totalUsers,
    activeUsers: totalUsers - bannedUsers,
    bannedUsers,
    platformHealth: totalUsers > 0 ? Math.round(((totalUsers - bannedUsers) / totalUsers) * 100) : 100,
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, i) => {
        const Icon = card.icon
        const value = values[card.key]

        return (
          <motion.div
            key={card.key}
            {...reveal}
            transition={{ duration: 0.5, ease, delay: 0.1 * i }}
            className="border border-border/60 bg-white dark:bg-card p-5 space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">
                {t(`cards.${card.key}`)}
              </span>
              <Icon className="h-4 w-4 text-muted-foreground/60" />
            </div>
            <p className="font-serif text-3xl text-heading tracking-tight">
              {isLoading ? "—" : card.key === "platformHealth" ? `${value}%` : value}
            </p>
          </motion.div>
        )
      })}
    </div>
  )
}
