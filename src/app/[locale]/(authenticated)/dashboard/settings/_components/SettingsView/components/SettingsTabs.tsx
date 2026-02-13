import { Bell, Globe, Lock, User } from "lucide-react"
import type { LucideIcon } from "lucide-react"

interface Tab {
  id: string
  label: string
  icon: LucideIcon
}

const TABS: Tab[] = [
  { id: "profile", label: "Profile", icon: User },
  { id: "account", label: "Account & Security", icon: Lock },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "preferences", label: "Preferences", icon: Globe },
]

interface SettingsTabsProps {
  activeTab: string
  onTabChange: (tabId: string) => void
}

export function SettingsTabs({ activeTab, onTabChange }: SettingsTabsProps) {
  return (
    <div className="lg:col-span-3 space-y-2">
      {TABS.map((tab) => {
        const Icon = tab.icon
        const isActive = activeTab === tab.id
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all duration-300 ${
              isActive
                ? "bg-primary text-white shadow-xl shadow-primary/20 scale-[1.02]"
                : "text-muted-foreground hover:bg-secondary/40 hover:text-heading"
            }`}
          >
            <Icon
              className={`h-4 w-4 ${isActive ? "text-white" : "text-muted-foreground"}`}
            />
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}
