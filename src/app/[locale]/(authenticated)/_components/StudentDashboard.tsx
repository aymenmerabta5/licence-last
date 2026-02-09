"use client"

import * as motion from "motion/react-client"
import { useTranslations } from "next-intl"

import { Briefcase, Heart, MessageSquare, MapPin, Calendar, ArrowRight } from "lucide-react"

import { StatsCard } from "./StatsCard"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export function StudentDashboard({ user }: { user: any }) {
  const t = useTranslations("dashboard.student")

  const stats = [
    {
      title: t("stats.applications"),
      value: "12",
      description: "4 pending review",
      icon: Briefcase,
      trend: "+2 this week",
    },
    {
      title: t("stats.savedOffers"),
      value: "8",
      description: "2 expiring soon",
      icon: Heart,
    },
    {
      title: t("stats.interviews"),
      value: "3",
      description: "Next: tomorrow at 10 AM",
      icon: MessageSquare,
      trend: "Rising",
    },
  ]

  const recommendedOffers = [
    {
      id: 1,
      title: "Frontend Developer Intern",
      company: "TechNexus Solutions",
      location: "Algiers (Hybrid)",
      type: "End-of-Studies",
      tags: ["React", "TypeScript", "Tailwind"],
      date: "2 days ago",
    },
    {
      id: 2,
      title: "Data Science Trainee",
      company: "DataStream AI",
      location: "Oran (On-site)",
      type: "Clinical Internship",
      tags: ["Python", "PyTorch", "SQL"],
      date: "5 days ago",
    },
  ]

  const recentActivity = [
    { id: 1, type: "status", message: "Application for 'UX Designer' moved to 'Interview'", time: "2h ago" },
    { id: 2, type: "view", message: "Djezzy viewed your profile", time: "5h ago" },
    { id: 3, type: "offer", message: "New matching offer: 'Backend Node.js Intern'", time: "1d ago" },
  ]

  return (
    <div className="space-y-8">
      {/* ── Welcome Hero ── */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-heading p-8 text-white"
      >
        <div className="relative z-10 max-w-2xl space-y-4">
          <Badge className="bg-primary text-white border-none uppercase tracking-widest text-[10px] py-1 px-3">
            Profile Strength: 85%
          </Badge>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold leading-tight">
            Ready to secure your <span className="text-primary italic">dream internship</span>, {user.name?.split(" ")[0]}?
          </h2>
          <p className="text-white/60 text-sm font-light leading-relaxed">
            Your profile is attractingattention. 3 companies viewed your CV this week. 
            Complete your last skill test to become a Top 5% candidate.
          </p>
          <div className="flex flex-wrap gap-4 pt-4">
            <Button variant="editorial" size="editorial" className="bg-primary border-primary text-white hover:bg-white hover:text-heading">
              Complete Profile
            </Button>
            <Button variant="editorial-outline" size="editorial" className="border-white/20 text-white hover:bg-white/10">
              Upload New Resume
            </Button>
          </div>
        </div>
        {/* Background Decor */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-[100px] rounded-full translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary/10 blur-[80px] rounded-full -translate-x-1/2 translate-y-1/2" />
      </motion.div>

      {/* ── Stats Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <StatsCard key={i} index={i} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Feed: Recommended Offers */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-2xl font-bold text-heading">{t("recentOffers")}</h2>
            <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80 group text-xs font-bold uppercase tracking-widest">
              Explore All <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>
          <div className="space-y-4">
            {recommendedOffers.map((offer) => (
              <Card key={offer.id} className="group hover:ring-1 hover:ring-primary/20 transition-all cursor-pointer border-border/50 bg-background hover:bg-secondary/5 shadow-sm">
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-2">
                       <div className="flex items-center gap-2">
                         <span className="text-sm font-serif font-bold text-primary">{offer.company}</span>
                         <span className="h-1 w-1 rounded-full bg-border" />
                         <span className="text-xs text-muted-foreground flex items-center gap-1">
                           <MapPin className="h-3 w-3" /> {offer.location}
                         </span>
                       </div>
                       <h3 className="text-lg font-bold leading-tight group-hover:text-primary transition-colors">{offer.title}</h3>
                       <div className="flex flex-wrap gap-2 pt-1">
                         {offer.tags.map((tag) => (
                           <Badge key={tag} variant="secondary" className="bg-secondary/50 text-[9px] uppercase font-bold tracking-wider rounded-none px-2 py-0.5 border-none">
                             {tag}
                           </Badge>
                         ))}
                       </div>
                    </div>
                    <div className="flex flex-col items-start sm:items-end justify-between gap-3 shrink-0">
                      <Badge className="bg-heading text-white border-none text-[9px] font-bold uppercase tracking-[0.2em] px-3 py-1 rounded-none italic">
                        {offer.type}
                      </Badge>
                      <span className="text-[10px] text-muted-foreground flex items-center gap-1.5 uppercase tracking-wider font-medium">
                        <Calendar className="h-3.5 w-3.5" /> {offer.date}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Sidebar: Activity & Skills */}
        <div className="lg:col-span-4 space-y-8">
          {/* Skill Stack */}
          <section className="space-y-4">
            <h2 className="font-serif text-xl font-bold text-heading">{t("skillsSection")}</h2>
            <Card className="bg-background border-border/40 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all">
              <CardContent className="p-6 space-y-6">
                 {["React.js", "TypeScript", "Node.js", "UI/UX"].map((skill, i) => (
                   <div key={skill} className="space-y-3">
                      <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground">
                        <span>{skill}</span>
                        <span className="text-primary font-mono">{85 - i * 10}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-secondary/30 rounded-full overflow-hidden">
                         <motion.div
                           initial={{ width: 0 }}
                           animate={{ width: `${85 - i * 10}%` }}
                           transition={{ duration: 1.5, delay: i * 0.2, ease: "circOut" }}
                           className="h-full bg-primary"
                         />
                      </div>
                   </div>
                 ))}
                 <Button variant="editorial-outline" size="editorial-sm" className="w-full mt-4 text-[9px] h-10 border-border/60 hover:border-primary">
                   Skill Assessment <ArrowRight className="h-4 w-4 ml-2" />
                 </Button>
              </CardContent>
            </Card>
          </section>

          {/* Activity Feed */}
          <section className="space-y-4">
            <h2 className="font-serif text-xl font-bold text-heading">Activity</h2>
            <div className="space-y-4">
              {recentActivity.map((act) => (
                <div key={act.id} className="flex gap-4 group cursor-default">
                  <div className="h-2 w-2 rounded-full bg-primary mt-1.5 shrink-0 group-hover:scale-125 transition-transform" />
                  <div className="space-y-1">
                    <p className="text-xs leading-relaxed text-foreground font-medium">{act.message}</p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">{act.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
