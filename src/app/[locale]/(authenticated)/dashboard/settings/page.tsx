"use client"

import { useState } from "react"
import { useTheme } from "next-themes"
import {
  Bell,
  Briefcase,
  Camera,
  Check,
  ChevronRight,
  FileText,
  Globe,
  Lock,
  MapPin,
  Monitor,
  Moon,
  Shield,
  Sun,
  User,
} from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { TextAreaField, TextField } from "@/components/form-fields"

import { SkillsManager } from "@/app/[locale]/(authenticated)/dashboard/settings/_components/SkillsManager"

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile")
  const { theme, setTheme } = useTheme()

  const [fullName, setFullName] = useState("Aymen Merabta")
  const [primaryRole, setPrimaryRole] = useState("Senior Full Stack Student")
  const [location, setLocation] = useState("Algiers, Algeria")
  const [linkedinUrl, setLinkedinUrl] = useState("linkedin.com/in/amerabta")
  const [bio, setBio] = useState(
    "Passionate about building scalable web applications and elegant user interfaces. Currently focusing on Next.js, TypeScript, and AI-driven experiences.",
  )
  
  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "account", label: "Account & Security", icon: Lock },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "preferences", label: "Preferences", icon: Globe },
  ]

  const avatarInitial = (fullName.trim().charAt(0) || "A").toUpperCase()

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
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-500">
              {/* Profile Header Card */}
              <Card className="border-border/40 bg-background rounded-3xl overflow-hidden shadow-sm">
                <CardHeader className="bg-secondary/10 px-8 py-10 relative overflow-hidden border-b border-border/20">
                   <div className="absolute inset-y-0 end-6 flex items-center opacity-[0.06] pointer-events-none" aria-hidden="true">
                      <User className="h-44 w-44" />
                   </div>
                   <CardTitle className="font-serif text-2xl">Profile Identity</CardTitle>
                   <CardDescription className="font-medium">Information that will be visible to companies and administrators</CardDescription>
                </CardHeader>
                <CardContent className="p-8 space-y-8">
                   {/* Avatar Upload */}
                   <div className="flex flex-col sm:flex-row sm:items-center gap-8">
                        <div className="relative group">
                           <div className="h-28 w-28 rounded-3xl bg-primary/10 flex items-center justify-center text-primary text-4xl font-serif font-bold transition-all group-hover:bg-primary/20">
                              {avatarInitial}
                           </div>
                          <button className="absolute -bottom-2 -end-2 h-10 w-10 rounded-2xl bg-background border border-border shadow-lg flex items-center justify-center hover:scale-110 transition-transform dark:bg-card">
                             <Camera className="h-4 w-4" />
                          </button>
                       </div>
                       <div className="space-y-2">
                         <h4 className="font-bold text-sm">Profile Picture</h4>
                         <p className="text-xs text-muted-foreground max-w-xs">We recommend an image of at least 400x400. Gifs work too!</p>
                         <div className="flex gap-2 pt-2">
                            <Button variant="outline" size="sm" className="rounded-lg h-9 px-4 text-[11px] font-bold uppercase tracking-widest">Change Photo</Button>
                            <Button variant="ghost" size="sm" className="rounded-lg h-9 px-4 text-[11px] font-bold uppercase tracking-widest text-destructive hover:bg-destructive/5">Remove</Button>
                         </div>
                      </div>
                   </div>

                   <div className="h-px bg-border/20 w-full" />

                    {/* Basic Info Form */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <TextField
                        id="settings-full-name"
                        label="Full Name"
                        icon={User}
                        value={fullName}
                        onChange={setFullName}
                      />
                      <TextField
                        id="settings-primary-role"
                        label="Primary Role"
                        icon={Briefcase}
                        value={primaryRole}
                        onChange={setPrimaryRole}
                      />
                      <TextField
                        id="settings-location"
                        label="Location"
                        icon={MapPin}
                        value={location}
                        onChange={setLocation}
                      />
                      <TextField
                        id="settings-linkedin-url"
                        label="LinkedIn URL"
                        icon={Globe}
                        type="url"
                        value={linkedinUrl}
                        onChange={setLinkedinUrl}
                      />
                    </div>

                    <TextAreaField
                      id="settings-bio"
                      label="Professional Narrative (Bio)"
                      icon={FileText}
                      value={bio}
                      onChange={setBio}
                      rows={5}
                      className="min-h-[140px]"
                    />

                    <div className="h-px bg-border/20 w-full" />

                    <SkillsManager />

                    <div className="pt-6 flex justify-end gap-3">
                       <Button variant="editorial-outline" className="rounded-xl h-12 px-8 bg-background border-border/40">Cancel</Button>
                       <Button variant="editorial" className="rounded-xl h-12 px-8 shadow-lg shadow-primary/20">Save Changes</Button>
                    </div>
                 </CardContent>
               </Card>
            </div>
          )}

          {activeTab === "account" && (
             <div className="space-y-6 animate-in fade-in slide-in-from-bottom-5 duration-500">
                <Card className="border-border/40 bg-background rounded-3xl overflow-hidden shadow-sm">
                  <CardHeader className="p-8">
                     <CardTitle className="font-serif text-2xl flex items-center gap-3">
                        <Shield className="h-6 w-6 text-primary" /> Security Baseline
                     </CardTitle>
                     <CardDescription className="font-medium">Keep your account secure by following best practices.</CardDescription>
                  </CardHeader>
                  <CardContent className="p-8 space-y-10">
                     <div className="flex items-center justify-between gap-10">
                        <div className="space-y-1">
                           <h4 className="font-bold">Primary Email</h4>
                           <p className="text-xs text-muted-foreground">Used for login and all official notifications.</p>
                        </div>
                        <div className="flex items-center gap-3">
                           <span className="text-sm font-medium">aymen.mer@university.edu</span>
                           <Badge className="bg-green-500/10 text-green-600 border-none font-bold uppercase tracking-widest text-[9px] px-2 py-1">Verified</Badge>
                           <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-secondary"><ChevronRight className="h-4 w-4" /></Button>
                        </div>
                     </div>

                     <div className="h-px bg-border/20" />

                     <div className="flex items-center justify-between gap-10">
                        <div className="space-y-1">
                           <h4 className="font-bold">Security Password</h4>
                           <p className="text-xs text-muted-foreground">Last updated 4 months ago.</p>
                        </div>
                        <Button variant="editorial-outline" className="rounded-xl h-11 border-border/40 hover:border-heading">Update Password</Button>
                     </div>

                     <div className="h-px bg-border/20" />

                     <div className="flex items-center justify-between gap-10 opacity-50">
                        <div className="space-y-1">
                           <h4 className="font-bold">Two-Factor Auth (2FA)</h4>
                           <p className="text-xs text-muted-foreground italic">Feature coming soon in Vol. II</p>
                        </div>
                        <Button variant="ghost" disabled className="rounded-xl h-11 bg-secondary/50">Enable</Button>
                     </div>
                  </CardContent>
                </Card>

                <Card className="border-destructive/20 bg-destructive/5 rounded-3xl p-8 space-y-4">
                   <h4 className="font-bold text-destructive">Termination Zone</h4>
                   <p className="text-sm text-destructive/70 font-medium">Once you delete your account, there is no going back. All your internship history and documents will be permanently wiped.</p>
                   <Button variant="editorial" className="bg-destructive hover:bg-destructive/90 text-white rounded-xl h-11 px-8">Delete Account</Button>
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
