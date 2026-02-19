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
    <div className="space-y-12 pb-24">
      {/* Editorial masthead */}
      <header className="relative pt-6 pb-2">
        {/* Atmospheric mesh gradient */}
        <div className="absolute inset-x-0 -top-10 -z-10 h-64 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-primary/[0.04] via-transparent to-transparent opacity-100 mix-blend-multiply dark:mix-blend-screen" />

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="space-y-5 max-w-2xl text-balance">
            <div className="inline-flex items-center gap-2.5 rounded-full border border-border/40 bg-secondary/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.25em] text-muted-foreground shadow-sm backdrop-blur-sm">
              <span className="flex h-2 w-2 items-center justify-center rounded-full bg-primary/20">
                <span className="h-1 w-1 rounded-full bg-primary animate-pulse" />
              </span>
              Account Directory
            </div>

            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-heading tracking-tight leading-[1.05]">
              System{" "}
              <span className="font-light italic text-muted-foreground">
                Settings
              </span>
            </h1>

            <p className="text-base sm:text-lg text-muted-foreground/80 leading-relaxed font-medium max-w-xl">
              Curate your digital profile, configure cryptographic security
              measures, and calibrate your ecosystem.
            </p>
          </div>

          <div className="hidden lg:flex flex-col items-end justify-end gap-3 pb-1">
            <div className="h-14 w-14 flex items-center justify-center rounded-2xl bg-secondary/30 border border-border/50 text-primary shadow-inner">
              <Settings className="h-6 w-6 stroke-1 animate-[spin_10s_linear_infinite]" />
            </div>
            <div className="text-right font-mono text-[9px] uppercase tracking-widest text-muted-foreground/50">
              <p>v2.4.0 &middot; Sec.Level: Alpha</p>
              <p className="mt-1">Last sync: Just now</p>
            </div>
          </div>
        </div>

        {/* Decorative divider */}
        <div className="mt-10 flex items-center">
          <div className="h-[2px] w-12 bg-primary/60" />
          <div className="h-[1px] flex-1 bg-gradient-to-r from-border/50 via-border/20 to-transparent" />
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
