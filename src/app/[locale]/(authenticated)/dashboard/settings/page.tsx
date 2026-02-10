"use client"

import { useMemo, useState } from "react"
import { useTheme } from "next-themes"
import { useQuery } from "@tanstack/react-query"
import {
  Bell,
  Check,
  Globe,
  Lock,
  Monitor,
  Moon,
  Sun,
  User,
} from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"

import { orpc } from "@/server/orpc/client"

import { AccountSettingsTab } from "@/app/[locale]/(authenticated)/dashboard/settings/_components/AccountSettingsTab"
import { ProfileSettingsTab } from "@/app/[locale]/(authenticated)/dashboard/settings/_components/ProfileSettingsTab"

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile")
  const { theme, setTheme } = useTheme()

  const meQueryOptions = useMemo(() => orpc.users.getMe.queryOptions(), [])
  const profileQueryOptions = useMemo(() => orpc.students.getProfile.queryOptions(), [])

  const meQuery = useQuery(meQueryOptions)
  const isStudent = meQuery.data?.user.role === "student"
  const profileQuery = useQuery({
    ...profileQueryOptions,
    enabled: isStudent,
  })

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "account", label: "Account & Security", icon: Lock },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "preferences", label: "Preferences", icon: Globe },
  ]

  return (
    <div className="space-y-10 pb-20">
      <div className="flex flex-col gap-2">
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-heading">Settings</h1>
        <p className="text-muted-foreground font-medium">Manage your personal information and account preferences.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* ── Settings Sidebar ── */}
        <div className="lg:col-span-3 space-y-2">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all duration-300 ${
                  isActive 
                  ? "bg-primary text-white shadow-xl shadow-primary/20 scale-[1.02]" 
                  : "text-muted-foreground hover:bg-secondary/40 hover:text-heading"
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? "text-white" : "text-muted-foreground"}`} />
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* ── Content Area ── */}
        <div className="lg:col-span-9">
          {activeTab === "profile" && (
            <ProfileSettingsTab
              me={meQuery.data}
              studentProfile={profileQuery.data}
              isLoading={meQuery.isLoading || profileQuery.isLoading}
            />
          )}

          {activeTab === "account" && (
             <AccountSettingsTab me={meQuery.data} />
          )}

          {activeTab === "notifications" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-5 duration-500">
              <Card className="border-border/40 bg-background rounded-3xl overflow-hidden shadow-sm">
                <CardHeader className="p-8">
                  <CardTitle className="font-serif text-2xl flex items-center gap-3">
                    <Bell className="h-6 w-6 text-primary" /> Notifications
                  </CardTitle>
                  <CardDescription className="font-medium">
                    Notification preferences are coming soon.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-8">
                  <p className="text-sm text-muted-foreground">
                    For now, important updates are sent to your primary email: {meQuery.data?.user.email ?? ""}
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "preferences" && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-500">
               <Card className="border-border/40 bg-background rounded-3xl overflow-hidden shadow-sm">
                  <CardHeader className="p-8">
                     <CardTitle className="font-serif text-2xl flex items-center gap-3">
                        <Monitor className="h-6 w-6 text-primary" /> Visual Identity
                     </CardTitle>
                     <CardDescription className="font-medium">Personalize how Internex looks on your device.</CardDescription>
                  </CardHeader>
                  <CardContent className="p-8 space-y-10">
                     <div className="space-y-4">
                        <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Theme Selection</Label>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                           <button 
                             onClick={() => setTheme("light")}
                             className={`p-6 rounded-2xl border flex flex-col items-center gap-4 transition-all ${theme === "light" ? "border-primary bg-primary/5 ring-1 ring-primary/20" : "border-border/40 bg-secondary/10 hover:border-border"}`}
                           >
                              <div className="h-12 w-12 rounded-xl bg-white flex items-center justify-center shadow-lg"><Sun className="h-6 w-6 text-orange-500" /></div>
                              <span className="text-sm font-bold">Light Edition</span>
                              {theme === "light" && <Check className="h-4 w-4 text-primary mt-1" />}
                           </button>
                           <button 
                             onClick={() => setTheme("dark")}
                             className={`p-6 rounded-2xl border flex flex-col items-center gap-4 transition-all ${theme === "dark" ? "border-primary bg-primary/5 ring-1 ring-primary/20" : "border-border/40 bg-secondary/10 hover:border-border"}`}
                           >
                              <div className="h-12 w-12 rounded-xl bg-[#1a1a1a] flex items-center justify-center shadow-lg"><Moon className="h-6 w-6 text-amber-500" /></div>
                              <span className="text-sm font-bold">Night Edition</span>
                              {theme === "dark" && <Check className="h-4 w-4 text-primary mt-1" />}
                           </button>
                           <button 
                             onClick={() => setTheme("system")}
                             className={`p-6 rounded-2xl border flex flex-col items-center gap-4 transition-all ${theme === "system" ? "border-primary bg-primary/5 ring-1 ring-primary/20" : "border-border/40 bg-secondary/10 hover:border-border"}`}
                           >
                              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-white to-black flex items-center justify-center shadow-lg"><Monitor className="h-6 w-6 text-slate-500" /></div>
                              <span className="text-sm font-bold">System Default</span>
                              {theme === "system" && <Check className="h-4 w-4 text-primary mt-1" />}
                           </button>
                        </div>
                     </div>
                  </CardContent>
               </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
