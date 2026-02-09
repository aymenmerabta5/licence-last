"use client"

import { useTranslations } from "next-intl"
import { ShieldCheck, FileText, Globe, Activity, ArrowRight, Download } from "lucide-react"

import { StatsCard } from "./StatsCard"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export function AdminDashboard({ }: { user: { name: string | null; email: string; role: string | null | undefined } }) {
  const t = useTranslations("dashboard.admin")

  const stats = [
    {
      title: t("stats.totalPlacements"),
      value: "1,280",
      description: "Since Jan 2025",
      icon: Globe,
      trend: "+24% MoM",
    },
    {
      title: t("stats.pendingValidation"),
      value: "32",
      description: "Needs attention today",
      icon: ShieldCheck,
      trend: "Priority",
    },
    {
      title: t("stats.docsGenerated"),
      value: "412",
      description: "Official documents",
      icon: FileText,
      trend: "Auto-synced",
    },
  ]

  return (
    <div className="space-y-10">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <StatsCard key={i} index={i} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-2xl font-bold text-heading">{t("globalStats")}</h2>
            <Button variant="outline" size="sm" className="gap-2 rounded-xl border-border/60 hover:border-primary transition-all">
              <Download className="h-4 w-4" /> Export Report
            </Button>
          </div>
          <Card className="border border-border/40 shadow-sm bg-background rounded-2xl h-[400px] flex items-center justify-center relative overflow-hidden group">
             {/* Subtle background pattern */}
             <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]" />
             
             <CardContent className="relative z-10">
                <div className="text-center space-y-6">
                   <div className="inline-flex items-center justify-center p-6 rounded-3xl bg-primary/5 text-primary group-hover:scale-110 transition-transform duration-500">
                      <Activity className="h-10 w-10 animate-pulse" />
                   </div>
                   <div className="space-y-2">
                     <h3 className="text-xl font-bold tracking-tight">Live Placement Analytics</h3>
                     <p className="text-sm text-muted-foreground max-w-xs mx-auto">Interactive charts and real-time heatmap are initializing...</p>
                   </div>
                   <div className="flex justify-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary/20 animate-bounce" />
                      <div className="h-1.5 w-1.5 rounded-full bg-primary/40 animate-bounce [animation-delay:0.2s]" />
                      <div className="h-1.5 w-1.5 rounded-full bg-primary/60 animate-bounce [animation-delay:0.4s]" />
                   </div>
                </div>
             </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-4 space-y-8">
           <h2 className="font-serif text-2xl font-bold text-heading text-heading/80 uppercase tracking-widest text-[11px]">Administrative Actions</h2>
           <div className="grid grid-cols-1 gap-5">
              <Card className="p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer bg-background border border-border/40 group rounded-2xl">
                 <div className="p-2.5 rounded-xl bg-primary/5 text-primary w-fit mb-4 group-hover:bg-primary group-hover:text-white transition-all">
                    <ShieldCheck className="h-5 w-5" />
                 </div>
                 <h3 className="font-bold text-lg mb-2 text-heading">{t("actions.validatePlacements")}</h3>
                 <p className="text-xs text-muted-foreground leading-relaxed mb-5">Review and approve matching requests between students and companies.</p>
                 <div className="flex items-center gap-2 text-primary text-[10px] font-bold uppercase tracking-[0.2em] group-hover:gap-3 transition-all">
                    Open Queue <ArrowRight className="h-3.5 w-3.5" />
                 </div>
              </Card>
              
              <Card className="p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer bg-background border border-border/40 group rounded-2xl">
                 <div className="p-2.5 rounded-xl bg-orange-500/5 text-orange-500 w-fit mb-4 group-hover:bg-orange-500 group-hover:text-white transition-all">
                    <Activity className="h-5 w-5" />
                 </div>
                 <h3 className="font-bold text-lg mb-2 text-heading">{t("actions.systemHealth")}</h3>
                 <p className="text-xs text-muted-foreground leading-relaxed mb-5">Monitor server performance, API status, and database synchronization.</p>
                 <div className="flex items-center gap-2 text-orange-500 font-bold text-[10px] uppercase tracking-[0.2em] group-hover:gap-3 transition-all">
                    Access Console <ArrowRight className="h-3.5 w-3.5" />
                 </div>
              </Card>
           </div>
        </div>
      </div>
    </div>
  )
}
