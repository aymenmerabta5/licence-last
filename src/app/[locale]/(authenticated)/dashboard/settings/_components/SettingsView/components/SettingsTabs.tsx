import type { LucideIcon } from "lucide-react"
import { Bell, Lock, User } from "lucide-react"
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
]

interface SettingsTabsProps {
  activeTab: string
  onTabChange: (tabId: string) => void
}

export function SettingsTabs({ activeTab, onTabChange }: SettingsTabsProps) {
  return (
    <nav className="lg:col-span-3" aria-label="Settings sections">
      {/* ── Mobile: Horizontal scrollable tabs ── */}
      <Tabs
        value={activeTab}
        onValueChange={onTabChange}
        className="lg:hidden"
      >
        <TabsList variant="line" className="w-full justify-start gap-1 overflow-x-auto pb-2">
          {TABS.map((tab) => {
            const Icon = tab.icon
            return (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="shrink-0 whitespace-nowrap gap-1.5"
              >
                <Icon className="h-3.5 w-3.5" />
                {tab.label}
              </TabsTrigger>
            )
          })}
        </TabsList>
      </Tabs>

      {/* ── Desktop: Vertical sidebar ── */}
      <div className="hidden lg:block lg:sticky lg:top-24">
        <div className="border border-border/60 bg-card/30 dark:bg-card/50">
          <div className="px-5 py-3.5 border-b border-border/40 bg-muted/20 dark:bg-muted/10">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
              Navigation
            </h3>
          </div>

          <Tabs
            value={activeTab}
            onValueChange={onTabChange}
            orientation="vertical"
            className="gap-0"
          >
            <TabsList className="h-auto w-full flex-col gap-0 bg-transparent p-0">
              {TABS.map((tab) => {
                const Icon = tab.icon
                const isActive = activeTab === tab.id
                return (
                  <TabsTrigger
                    key={tab.id}
                    value={tab.id}
                    className={cn(
                      "group relative h-auto w-full justify-start gap-3 px-5 py-4 text-start transition-colors after:hidden border-b border-border/20 last:border-b-0",
                      isActive
                        ? "bg-primary/[0.04] dark:bg-primary/[0.08]"
                        : "hover:bg-muted/30",
                    )}
                  >
                    {isActive && (
                      <span className="absolute start-0 top-2 bottom-2 w-0.5 bg-primary" />
                    )}

                    <span
                      className={cn(
                        "flex h-8 w-8 shrink-0 items-center justify-center border transition-colors",
                        isActive
                          ? "border-primary/30 bg-primary/10 text-primary"
                          : "border-border/50 bg-muted/30 text-muted-foreground group-hover:border-primary/20 group-hover:text-foreground",
                      )}
                    >
                      <Icon className="h-4 w-4" />
                    </span>

                    <span className="min-w-0 flex-1">
                      <span
                        className={cn(
                          "block text-sm font-medium transition-colors",
                          isActive ? "text-primary" : "text-heading",
                        )}
                      >
                        {tab.label}
                      </span>
                      <span className="mt-0.5 block truncate text-[11px] text-muted-foreground/50">
                        {tab.hint}
                      </span>
                    </span>
                  </TabsTrigger>
                )
              })}
            </TabsList>
          </Tabs>
        </div>
      </div>
    </nav>
  )
}
