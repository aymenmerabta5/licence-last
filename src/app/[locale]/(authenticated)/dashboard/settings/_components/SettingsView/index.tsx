"use client"

import { Settings } from "lucide-react"

import { AccountSettingsTab } from "@/app/[locale]/(authenticated)/dashboard/settings/_components/AccountSettingsTab"
import { ProfileSettingsTab } from "@/app/[locale]/(authenticated)/dashboard/settings/_components/ProfileSettingsTab"

import { useSettingsData } from "@/app/[locale]/(authenticated)/dashboard/settings/_components/SettingsView/hooks/useSettingsData"
import { SettingsTabs } from "@/app/[locale]/(authenticated)/dashboard/settings/_components/SettingsView/components/SettingsTabs"
import { PreferencesTab } from "@/app/[locale]/(authenticated)/dashboard/settings/_components/SettingsView/components/PreferencesTab"
import { NotificationsTab } from "@/app/[locale]/(authenticated)/dashboard/settings/_components/SettingsView/components/NotificationsTab"

export function SettingsView() {
  const { activeTab, setActiveTab, me, meLoading, studentProfile, profileLoading } =
    useSettingsData()

  return (
    <div className="space-y-8 pb-20">
      {/* Editorial masthead */}
      <header className="relative">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1.5">
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-muted-foreground/60">
              Account
            </p>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-heading tracking-tight">
              Settings
            </h1>
            <p className="text-sm text-muted-foreground max-w-md">
              Manage your identity, security, and preferences.
            </p>
          </div>
          <div className="hidden sm:flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/5 border border-primary/10">
            <Settings className="h-6 w-6 text-primary/40" />
          </div>
        </div>
        <div className="mt-6 h-px bg-gradient-to-e from-border/60 via-border/30 to-transparent" />
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
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
