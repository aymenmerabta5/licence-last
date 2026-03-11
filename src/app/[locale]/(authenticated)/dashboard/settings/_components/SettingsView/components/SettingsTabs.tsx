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
      {/* ── Mobile: Horizontal scrollable pill tabs ── */}
      <div className="flex lg:hidden overflow-x-auto gap-2 pb-2 -mx-2 px-2 scrollbar-none">
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
                "flex items-center gap-2.5 whitespace-nowrap rounded-2xl px-5 py-3 text-sm font-bold transition-all duration-300 shrink-0 border",
                isActive
                  ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/25"
                  : "bg-card text-muted-foreground border-border/40 shadow-sm hover:bg-primary/[0.06] hover:text-foreground",
              )}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* ── Desktop: Vertical sidebar tabs with card container ── */}
      <div className="hidden lg:block lg:sticky lg:top-24">
        <div className="rounded-[2rem] border border-border/30 bg-card p-3 shadow-sm ring-1 ring-border/5">
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50 px-4 pt-3 pb-4">
            Navigation
          </h3>

          <div className="space-y-1">
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
                    "group relative w-full flex items-center gap-4 px-4 py-3.5 text-start rounded-xl transition-all duration-300 ease-out",
                    isActive
                      ? "bg-primary/[0.06] dark:bg-primary/[0.12]"
                      : "hover:bg-muted/80",
                  )}
                >
                  {isActive && (
                    <div className="absolute start-0 top-2 bottom-2 w-[3px] bg-primary rounded-e-full shadow-[0_0_12px_var(--color-primary)]" />
                  )}

                  <span
                    className={cn(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-all duration-300",
                      isActive
                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25 scale-105"
                        : "bg-muted text-muted-foreground group-hover:bg-primary/[0.08] group-hover:text-foreground group-hover:scale-105 group-active:scale-95",
                    )}
                  >
                    <Icon
                      className={cn(
                        "h-[18px] w-[18px] transition-all duration-300",
                        isActive && "stroke-[2.5px]",
                      )}
                    />
                  </span>

                  <div className="min-w-0 flex-1">
                    <span
                      className={cn(
                        "block text-[13px] font-bold tracking-wide transition-colors duration-300",
                        isActive
                          ? "text-primary"
                          : "text-heading group-hover:text-foreground",
                      )}
                    >
                      {tab.label}
                    </span>
                    <span className="block text-[11px] text-muted-foreground/50 leading-relaxed mt-0.5 truncate font-medium">
                      {tab.hint}
                    </span>
                  </div>

                  {isActive && (
                    <span className="h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_6px_var(--color-primary)] shrink-0" />
                  )}
                </button>
              )
            })}
          </div>

          {/* Decorative footer */}
          <div className="pt-4 pb-2 px-4 mt-2 border-t border-border/15">
            <div className="flex items-center gap-2">
              <span className="h-1 w-1 rounded-full bg-emerald-500/60 animate-pulse" />
              <p className="text-[9px] uppercase tracking-[0.2em] font-mono text-muted-foreground/40">
                System Active
              </p>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}
