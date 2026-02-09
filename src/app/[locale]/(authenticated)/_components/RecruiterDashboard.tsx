"use client"

import { useTranslations } from "next-intl"
import { Briefcase, Users, CheckCircle, Plus, ArrowRight } from "lucide-react"

import { StatsCard } from "./StatsCard"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export function RecruiterDashboard({ }: { user: { name: string | null; email: string; role: string | null | undefined } }) {
  const t = useTranslations("dashboard.recruiter")

  const stats = [
    {
      title: t("stats.activeOffers"),
      value: "5",
      description: "2 closing this week",
      icon: Briefcase,
      trend: "Stable",
    },
    {
      title: t("stats.totalApplicants"),
      value: "142",
      description: "24 new in the last 48h",
      icon: Users,
      trend: "+15%",
    },
    {
      title: t("stats.hired"),
      value: "18",
      description: "Matchings completed",
      icon: CheckCircle,
      trend: "95% goal",
    },
  ]

  const recentApplications = [
    { id: 1, name: "Sami Benali", role: "Software Engineer Intern", match: "98%", status: "Reviewing" },
    { id: 2, name: "Amira Kaced", role: "UI Designer Trainee", match: "94%", status: "Interviewed" },
    { id: 3, name: "Omar Farouk", role: "Data Analyst Intern", match: "89%", status: "New" },
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
            <h2 className="font-serif text-2xl font-bold text-heading">{t("pipeline")}</h2>
            <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80 group">
              View pipeline <ArrowRight className="h-4 w-4 ms-2 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>
          <Card className="border border-border/40 shadow-sm bg-background rounded-2xl overflow-hidden">
             <CardContent className="p-0">
                <div className="overflow-x-auto">
                   <table className="w-full text-sm text-start">
                     <thead className="text-[10px] uppercase text-muted-foreground/60 bg-secondary/20 border-b border-border/40">
                       <tr>
                         <th className="px-6 py-4 font-bold tracking-[0.1em]">Candidate</th>
                         <th className="px-6 py-4 font-bold tracking-[0.1em]">Target Role</th>
                         <th className="px-6 py-4 font-bold tracking-[0.1em]">Skill Match</th>
                         <th className="px-6 py-4 font-bold tracking-[0.1em]">Status</th>
                         <th className="px-6 py-4 font-bold tracking-[0.1em] text-end">Action</th>
                       </tr>
                     </thead>
                     <tbody className="divide-y divide-border/20">
                       {recentApplications.map((app) => (
                         <tr key={app.id} className="hover:bg-primary/[0.02] transition-colors group/row">
                           <td className="px-6 py-5 font-bold text-heading">{app.name}</td>
                           <td className="px-6 py-5 text-muted-foreground font-medium">{app.role}</td>
                           <td className="px-6 py-5">
                              <Badge className="bg-primary/5 text-primary border-none text-[9px] font-bold uppercase tracking-wider px-2.5 py-1">
                                {app.match} Match
                              </Badge>
                           </td>
                           <td className="px-6 py-5">
                              <span className="inline-flex items-center gap-1.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-heading">
                                <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" /> {app.status}
                              </span>
                           </td>
                           <td className="px-6 py-5 text-end">
                             <Button variant="ghost" size="sm" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-primary hover:bg-transparent transition-all">
                                Details <ArrowRight className="h-3 w-3 ms-1 opacity-0 group-hover/row:opacity-100 transition-all -translate-x-2 group-hover/row:translate-x-0" />
                             </Button>
                           </td>
                         </tr>
                       ))}
                     </tbody>
                   </table>
                </div>
             </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-4 space-y-6">
           <h2 className="font-serif text-2xl font-bold text-heading">Quick Actions</h2>
           <div className="space-y-4">
               <Button className="w-full justify-between h-auto py-5 px-6 rounded-2xl group transition-all" variant="default">
                  <div className="text-start">
                     <p className="font-bold text-sm">{t("actions.postOffer")}</p>
                     <p className="text-[10px] opacity-70 font-medium mt-0.5">Publish a new internship position</p>
                  </div>
                  <div className="bg-white/20 p-2 rounded-xl group-hover:bg-white group-hover:text-primary transition-all">
                    <Plus className="h-4 w-4" />
                  </div>
               </Button>
               <Button className="w-full justify-between h-auto py-5 px-6 rounded-2xl bg-background border border-border/40 text-heading hover:bg-secondary/20 group transition-all">
                  <div className="text-start">
                     <p className="font-bold text-sm tracking-tight">{t("actions.manageOffers")}</p>
                     <p className="text-[10px] text-muted-foreground font-medium mt-0.5">Edit or close existing offers</p>
                  </div>
                  <div className="p-2 rounded-xl bg-secondary group-hover:bg-primary/10 group-hover:text-primary transition-all">
                    <Briefcase className="h-4 w-4" />
                  </div>
               </Button>
           </div>
        </div>
      </div>
    </div>
  )
}
