"use client"

import {
  Mail,
  MapPin,
  Github,
  Linkedin,
  Globe,
  Award,
  BookOpen,
  Briefcase,
  Edit3,
  ShieldCheck
} from "lucide-react"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { StatsCard } from "../../_components/StatsCard"
import { Link } from "@/i18n/routing"

export default function ProfilePage() {
  
  // Dummy user data - in a real app this would come from a session/database
  const user = {
    name: "Aymen Merabta",
    role: "Senior Full Stack Student",
    email: "aymen.mer@university.edu",
    location: "Algiers, Algeria",
    bio: "Passionate about building scalable web applications and elegant user interfaces. Currently focusing on Next.js, TypeScript, and AI-driven experiences. Looking for an end-of-studies internship in high-impact tech companies.",
    avatar: "A",
    stats: [
      { title: "Profile Views", value: "248", description: "This month", icon: Globe, trend: "+12%" },
      { title: "Applications", value: "14", description: "In progress", icon: Briefcase },
      { title: "Skill Score", value: "92", description: "Top 5% candidate", icon: Award, trend: "Rising" }
    ],
    skills: ["React", "Next.js", "TypeScript", "Node.js", "Tailwind CSS", "PostgreSQL", "Docker", "Framer Motion"],
    languages: ["Arabic (Native)", "English (Professional)", "French (Professional)"],
    education: [
      { school: "University of Science and Technology (USTHB)", degree: "Master in Artificial Intelligence", period: "2023 - Present" },
      { school: "University of Science and Technology (USTHB)", degree: "Bachelor in Computer Science", period: "2020 - 2023" }
    ],
    experience: [
      { company: "Open Source Contributor", role: "Frontend Developer", period: "2023 - Present", description: "Contributing to various React-based libraries and maintaining personal projects." }
    ]
  }

  return (
    <div className="space-y-10 pb-20">
      {/* ── Header / Cover Section ── */}
      <section className="relative">
        <div className="h-48 sm:h-64 w-full rounded-3xl bg-gradient-to-r from-primary/20 via-primary/5 to-secondary/10 overflow-hidden relative">
           <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:20px_20px] opacity-10" />
           <div className="absolute top-10 end-10 w-64 h-64 bg-primary/10 blur-[100px] rounded-full" />
           <div className="absolute bottom-0 start-20 w-48 h-48 bg-secondary/10 blur-[80px] rounded-full" />
        </div>
        
        <div className="px-6 sm:px-10 -mt-16 sm:-mt-20 relative z-10 flex flex-col sm:flex-row sm:items-end gap-6">
           <div className="h-32 w-32 sm:h-40 sm:w-40 rounded-full border-8 border-background bg-primary flex items-center justify-center text-white text-5xl font-serif shadow-2xl">
              {user.avatar}
           </div>
           <div className="flex-1 pb-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                 <div>
                    <h1 className="text-3xl sm:text-4xl font-serif font-bold text-heading tracking-tight">{user.name}</h1>
                    <p className="text-primary font-bold uppercase tracking-[0.2em] text-[10px] sm:text-xs mt-1">{user.role}</p>
                 </div>
                 <div className="flex gap-3">
                    <Link href="/dashboard/settings">
                      <Button variant="editorial" className="rounded-xl h-11 px-6 shadow-lg shadow-primary/20">
                        <Edit3 className="h-4 w-4 me-2" /> Edit Profile
                      </Button>
                    </Link>
                    <Button variant="editorial-outline" className="rounded-xl h-11 px-6 bg-background border-border/40 hover:border-primary">
                       Share
                    </Button>
                 </div>
              </div>
           </div>
        </div>
      </section>

      {/* ── Stats Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {user.stats.map((stat, i) => (
          <StatsCard key={i} index={i} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* ── Left Column: Info & Skills ── */}
        <div className="lg:col-span-4 space-y-10">
           {/* About Section */}
           <section className="space-y-4">
              <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground/60">The Narrative</h2>
              <Card className="bg-background border-border/40 rounded-2xl p-6 shadow-sm">
                 <p className="text-sm leading-relaxed text-foreground/80 font-medium">
                    {user.bio}
                 </p>
                 <div className="mt-8 pt-6 border-t border-border/20 space-y-4">
                    <div className="flex items-center gap-3 text-xs">
                       <Mail className="h-4 w-4 text-primary" />
                       <span className="font-bold text-heading">{user.email}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs">
                       <MapPin className="h-4 w-4 text-primary" />
                       <span className="font-bold text-heading">{user.location}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs">
                       <Globe className="h-4 w-4 text-primary" />
                       <span className="font-bold text-heading">aymen-dev.io</span>
                    </div>
                 </div>
              </Card>
           </section>

           {/* Skills Section */}
           <section className="space-y-4">
              <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground/60">Skill Stack</h2>
              <div className="flex flex-wrap gap-2">
                 {user.skills.map((skill) => (
                    <Badge key={skill} className="bg-secondary/20 hover:bg-primary/10 hover:text-primary text-heading border-none py-2 px-4 rounded-xl text-[11px] font-bold transition-all">
                       {skill}
                    </Badge>
                 ))}
              </div>
           </section>

           {/* Social Connect */}
           <section className="space-y-4">
              <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground/60">Connect</h2>
              <div className="grid grid-cols-2 gap-3">
                 <Button variant="editorial-outline" className="justify-start gap-3 rounded-xl border-border/40 hover:border-black dark:hover:border-white h-12">
                    <Github className="h-4 w-4" /> Github
                 </Button>
                 <Button variant="editorial-outline" className="justify-start gap-3 rounded-xl border-border/40 hover:border-blue-600 h-12">
                    <Linkedin className="h-4 w-4" /> LinkedIn
                 </Button>
              </div>
           </section>
        </div>

        {/* ── Right Column: Experience & Education ── */}
        <div className="lg:col-span-8 space-y-12">
           {/* Experience Section */}
           <section className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="font-serif text-2xl font-bold text-heading">Experience</h2>
                <ShieldCheck className="h-5 w-5 text-green-500" />
              </div>
              <div className="relative space-y-8 before:absolute before:inset-y-0 before:start-4 before:w-px before:bg-border/30">
                 {user.experience.map((exp, i) => (
                    <div key={i} className="relative ps-12">
                       <div className="absolute start-2 top-2 h-4 w-4 rounded-full bg-primary ring-4 ring-background z-10" />
                       <Card className="p-6 border-border/40 bg-background rounded-2xl shadow-sm hover:shadow-md transition-all group">
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-4">
                             <div>
                                <h3 className="font-bold text-lg text-heading group-hover:text-primary transition-colors">{exp.role}</h3>
                                <p className="text-sm font-serif italic text-primary">{exp.company}</p>
                             </div>
                             <Badge variant="secondary" className="bg-secondary/30 text-[10px] font-bold whitespace-nowrap px-3 py-1">
                                {exp.period}
                             </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground leading-relaxed">
                             {exp.description}
                          </p>
                       </Card>
                    </div>
                 ))}
              </div>
           </section>

           {/* Education Section */}
           <section className="space-y-6">
              <h2 className="font-serif text-2xl font-bold text-heading">Education</h2>
              <div className="space-y-4">
                 {user.education.map((edu, i) => (
                    <Card key={i} className="p-6 border-transparent bg-secondary/[0.03] hover:bg-secondary/[0.06] rounded-2xl flex items-start gap-5 group transition-all">
                       <div className="h-12 w-12 rounded-xl bg-white dark:bg-card border border-border/20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                          <BookOpen className="h-6 w-6 text-primary" />
                       </div>
                       <div className="flex-1">
                          <div className="flex items-center justify-between gap-4">
                             <h4 className="font-bold text-heading">{edu.degree}</h4>
                             <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">{edu.period}</span>
                          </div>
                          <p className="text-xs text-muted-foreground font-medium mt-1">{edu.school}</p>
                       </div>
                    </Card>
                 ))}
              </div>
           </section>
        </div>
      </div>
    </div>
  )
}
