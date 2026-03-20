import type { LucideIcon } from "lucide-react"
import { Bell, Globe, Lock, User } from "lucide-react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
      <Tabs
        value={activeTab}
        onValueChange={onTabChange}
        className="lg:hidden"
      >
        <TabsList className="scrollbar-none -mx-2 flex w-auto overflow-x-auto gap-2 bg-transparent px-2 pb-2 pt-0">
          {TABS.map((tab) => {
            const Icon = tab.icon
            return (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="h-auto shrink-0 whitespace-nowrap rounded-2xl border px-5 py-3 text-sm font-bold shadow-sm transition-all duration-300 data-active:border-primary data-active:bg-primary data-active:text-primary-foreground data-active:shadow-lg data-active:shadow-primary/25 not-data-active:border-border/40 not-data-active:bg-card not-data-active:text-muted-foreground not-data-active:hover:bg-primary/[0.06] not-data-active:hover:text-foreground after:hidden"
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </TabsTrigger>
            )
          })}
        </TabsList>
      </Tabs>

      {/* ── Desktop: Vertical sidebar tabs with card container ── */}
      <div className="hidden lg:block lg:sticky lg:top-24">
        <div className="rounded-[2rem] border border-border/30 bg-card p-3 shadow-sm ring-1 ring-border/5">
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50 px-4 pt-3 pb-4">
            Navigation
          </h3>

          <Tabs
            value={activeTab}
            onValueChange={onTabChange}
            orientation="vertical"
            className="gap-0"
          >
            <TabsList className="h-auto w-full flex-col gap-1 bg-transparent p-0">
              {TABS.map((tab) => {
                const Icon = tab.icon
                const isActive = activeTab === tab.id
                return (
                  <TabsTrigger
                    key={tab.id}
                    value={tab.id}
                    className={cn(
                      "group relative h-auto w-full justify-start gap-4 rounded-xl px-4 py-3.5 text-start transition-all duration-300 ease-out after:hidden",
                      isActive
                        ? "bg-primary/[0.06] text-primary dark:bg-primary/[0.12]"
                        : "hover:bg-muted/80",
                    )}
                  >
                    {isActive && (
                      <span className="absolute start-0 top-2 bottom-2 w-[3px] rounded-e-full bg-primary shadow-[0_0_12px_var(--color-primary)]" />
                    )}

                    <span
                      className={cn(
                        "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-all duration-300",
                        isActive
                          ? "scale-105 bg-primary text-primary-foreground shadow-lg shadow-primary/25"
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

                    <span className="min-w-0 flex-1">
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
                      <span className="mt-0.5 block truncate text-[11px] font-medium leading-relaxed text-muted-foreground/50">
                        {tab.hint}
                      </span>
                    </span>

                    {isActive && (
                      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary shadow-[0_0_6px_var(--color-primary)]" />
                    )}
                  </TabsTrigger>
                )
              })}
            </TabsList>
          </Tabs>

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
