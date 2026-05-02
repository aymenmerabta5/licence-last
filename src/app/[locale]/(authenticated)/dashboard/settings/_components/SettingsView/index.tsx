"use client"

import { useState } from "react"
import { AnimatePresence } from "motion/react"
import * as motion from "motion/react-client"

import { AccountSettingsTab } from "@/app/[locale]/(authenticated)/dashboard/settings/_components/AccountSettingsTab"
import { ProfileSettingsTab } from "@/app/[locale]/(authenticated)/dashboard/settings/_components/ProfileSettingsTab"
import { NotificationsTab } from "@/app/[locale]/(authenticated)/dashboard/settings/_components/SettingsView/components/NotificationsTab"
import { SettingsHeader } from "@/app/[locale]/(authenticated)/dashboard/settings/_components/SettingsView/components/SettingsHeader"
import { SettingsTabs } from "@/app/[locale]/(authenticated)/dashboard/settings/_components/SettingsView/components/SettingsTabs"
import { ease } from "@/lib/animations"
import type { MeResult, StudentProfileResult } from "@/app/[locale]/(authenticated)/dashboard/settings/_components/ProfileSettingsTab/types"

interface SettingsViewProps {
  me: MeResult
  studentProfile: StudentProfileResult | null
}

export function SettingsView({ me, studentProfile }: SettingsViewProps) {
  const [activeTab, setActiveTab] = useState("profile")

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-24">
      {/* ── Editorial Hero Header ── */}
      <SettingsHeader />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14">
        <SettingsTabs activeTab={activeTab} onTabChange={setActiveTab} />

        <div className="lg:col-span-9 min-w-0">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35, ease }}
            >
              {activeTab === "profile" && (
                <ProfileSettingsTab
                  me={me}
                  studentProfile={studentProfile}
                  isLoading={false}
                />
              )}

              {activeTab === "account" && <AccountSettingsTab me={me} />}

              {activeTab === "notifications" && (
                <NotificationsTab email={me?.user.email ?? ""} />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
