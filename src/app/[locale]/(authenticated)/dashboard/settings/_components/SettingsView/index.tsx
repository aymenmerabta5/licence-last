"use client"

import { AccountSettingsTab } from "../AccountSettingsTab"
import { ProfileSettingsTab } from "../ProfileSettingsTab"

import { useSettingsData } from "./hooks/useSettingsData"
import { SettingsTabs } from "./components/SettingsTabs"
import { PreferencesTab } from "./components/PreferencesTab"
import { NotificationsTab } from "./components/NotificationsTab"

export function SettingsView() {
  const { activeTab, setActiveTab, me, meLoading, studentProfile, profileLoading } =
    useSettingsData()

  return (
    <div className="space-y-10 pb-20">
      <div className="flex flex-col gap-2">
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-heading">
          Settings
        </h1>
        <p className="text-muted-foreground font-medium">
          Manage your personal information and account preferences.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <SettingsTabs activeTab={activeTab} onTabChange={setActiveTab} />

        <div className="lg:col-span-9">
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
