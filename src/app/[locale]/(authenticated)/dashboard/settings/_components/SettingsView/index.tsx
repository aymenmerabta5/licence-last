"use client"

import { Settings } from "lucide-react"

import { AccountSettingsTab } from "@/app/[locale]/(authenticated)/dashboard/settings/_components/AccountSettingsTab"
import { ProfileSettingsTab } from "@/app/[locale]/(authenticated)/dashboard/settings/_components/ProfileSettingsTab"
import { NotificationsTab } from "@/app/[locale]/(authenticated)/dashboard/settings/_components/SettingsView/components/NotificationsTab"
import { PreferencesTab } from "@/app/[locale]/(authenticated)/dashboard/settings/_components/SettingsView/components/PreferencesTab"
import { SettingsTabs } from "@/app/[locale]/(authenticated)/dashboard/settings/_components/SettingsView/components/SettingsTabs"
import { useSettingsData } from "@/app/[locale]/(authenticated)/dashboard/settings/_components/SettingsView/hooks/useSettingsData"

export function SettingsView() {
  const {
    activeTab,
    setActiveTab,
    me,
    meLoading,
    studentProfile,
    profileLoading,
  } = useSettingsData()

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-24">
      <header className="space-y-3">
        <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-muted-foreground/50">
          Account Directory
        </p>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3">
            <h1 className="font-serif text-[clamp(2.25rem,5vw,3.25rem)] leading-none tracking-tight text-heading">
              System Settings
            </h1>
            <p className="text-muted-foreground text-sm font-light tracking-wide max-w-2xl">
              Curate your digital profile, configure cryptographic security
              measures, and calibrate your ecosystem.
            </p>
          </div>
          <div className="hidden lg:flex flex-col items-end justify-end gap-3 pb-1 border-l border-border/40 pl-6 shrink-0">
            <div className="h-10 w-10 flex items-center justify-center rounded-2xl bg-secondary/30 border border-border/50 text-primary shadow-inner">
              <Settings className="h-5 w-5 stroke-1 animate-[spin_10s_linear_infinite]" />
            </div>
            <div className="text-right font-mono text-[9px] uppercase tracking-widest text-muted-foreground/50">
              <p>v2.4.0</p>
            </div>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14">
        <SettingsTabs activeTab={activeTab} onTabChange={setActiveTab} />

        <div className="lg:col-span-9 min-w-0">
          {activeTab === "profile" && (
            <ProfileSettingsTab
              me={me}
              studentProfile={studentProfile}
              isLoading={meLoading || profileLoading}
            />
          )}

          {activeTab === "account" && <AccountSettingsTab me={me} />}

          {activeTab === "notifications" && (
            <NotificationsTab email={me?.user.email ?? ""} />
          )}

          {activeTab === "preferences" && <PreferencesTab />}
        </div>
      </div>
    </div>
  )
}
