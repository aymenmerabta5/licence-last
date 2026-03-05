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
      <div className="lg:sticky lg:top-24 space-y-1.5">
        <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50 px-5 mb-4">
          Navigation Directory
        </h3>

        <div className="space-y-1 relative before:absolute before:inset-y-0 before:start-0 before:w-px before:bg-border/30">
          {TABS.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onTabChange(tab.id)}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "group relative w-full flex items-center gap-4 px-5 py-4 text-start transition-all duration-500 ease-out",
                  isActive
                    ? "bg-primary/[0.03] dark:bg-primary/[0.08]"
                    : "hover:bg-secondary/40",
                )}
              >
                {isActive && (
                  <div className="absolute start-0 inset-y-0 w-0.5 bg-primary rounded-e-full shadow-[0_0_8px_var(--color-primary)]" />
                )}

                <span
                  className={cn(
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-all duration-500",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-md shadow-primary/20 scale-110"
                      : "bg-secondary text-muted-foreground group-hover:bg-secondary/80 group-hover:text-foreground group-hover:scale-105 group-active:scale-95",
                  )}
                >
                  <Icon
                    className={cn("h-4 w-4", isActive && "stroke-[2.5px]")}
                  />
                </span>

                <div className="min-w-0 flex-1">
                  <span
                    className={cn(
                      "block text-sm font-bold tracking-wide transition-colors duration-300",
                      isActive
                        ? "text-primary"
                        : "text-heading group-hover:text-foreground",
                    )}
                  >
                    {tab.label}
                  </span>
                  <span className="block text-xs text-muted-foreground/60 leading-relaxed mt-0.5 truncate font-medium">
                    {tab.hint}
                  </span>
                </div>
              </button>
            )
          })}
        </div>

        {/* Decorative elements */}
        <div className="pt-6 px-5 hidden lg:block">
          <div className="h-px bg-gradient-to-r from-border/50 to-transparent mb-4" />
          <p className="text-[9px] uppercase tracking-[0.2em] font-mono text-muted-foreground/40">
            System Nav. Active
          </p>
        </div>
      </div>
    </nav>
  )
}
