import type { LucideIcon } from "lucide-react"
import { Bell, Globe, Lock, User } from "lucide-react"
import { cn } from "@/lib/utils"

interface Tab {
  id: string
  label: string
  hint: string
  icon: LucideIcon
}

const TABS: Tab[] = [
  { id: "profile", label: "Profile", hint: "Identity & details", icon: User },
  { id: "account", label: "Security", hint: "Password & 2FA", icon: Lock },
  {
    id: "notifications",
    label: "Notifications",
    hint: "Email & alerts",
    icon: Bell,
  },
  {
    id: "preferences",
    label: "Preferences",
    hint: "Theme & display",
    icon: Globe,
  },
]

interface SettingsTabsProps {
  activeTab: string
  onTabChange: (tabId: string) => void
}

export function SettingsTabs({ activeTab, onTabChange }: SettingsTabsProps) {
  return (
    <nav className="lg:col-span-3" aria-label="Settings sections">
      <div className="lg:sticky lg:top-24 space-y-1">
        {TABS.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "group relative w-full flex items-center gap-3.5 px-4 py-3.5 rounded-2xl text-start transition-all duration-300",
                !isActive && "hover:bg-secondary/30",
              )}
            >
              <span
                className={cn(
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-all duration-300",
                  isActive
                    ? "bg-primary text-white shadow-md shadow-primary/25"
                    : "bg-secondary/40 text-muted-foreground group-hover:bg-secondary/60 group-hover:text-foreground",
                )}
              >
                <Icon className="h-4 w-4" />
              </span>

              <div className="min-w-0">
                <span
                  className={cn(
                    "block text-sm font-bold leading-tight transition-colors",
                    isActive
                      ? "text-heading"
                      : "text-muted-foreground group-hover:text-foreground",
                  )}
                >
                  {tab.label}
                </span>
                <span className="block text-[11px] text-muted-foreground/60 leading-tight mt-0.5 truncate">
                  {tab.hint}
                </span>
              </div>
            </button>
          )
        })}

        {/* Decorative rule */}
        <div className="pt-3">
          <div className="h-px bg-gradient-to-e from-border/40 to-transparent" />
        </div>
      </div>
    </nav>
  )
}
