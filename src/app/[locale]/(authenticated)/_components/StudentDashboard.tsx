"use client"

import * as motion from "motion/react-client"
import { useTranslations } from "next-intl"

import {
  Briefcase,
  CheckCircle2,
  Wrench,
  MapPin,
  Calendar,
  ArrowRight,
  Search,
  ExternalLink,
} from "lucide-react"

import { StatsCard } from "./StatsCard"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Link } from "@/i18n/routing"
import { getWilayaName } from "@/lib/wilayas"

interface ApplicationRow {
  id: string
  status: string
  createdAt: string
  offerTitle: string
  companyName: string
  companyLogoUrl: string | null
  offerInternshipType: string
  offerWorkMode: string | null
  offerWilayaCode: number | null
}

interface OfferRow {
  id: string
  title: string
  companyName: string
  companyLogoUrl: string | null
  internshipType: string
  workMode: string | null
  wilayaCode: number | null
  createdAt: string
  skills: { id: string; name: string; slug: string; category: string | null }[]
}

interface StudentDashboardData {
  stats: {
    totalApplications: number
    pendingApplications: number
    acceptedApplications: number
    skillsCount: number
  }
  recentApplications: ApplicationRow[]
  recommendedOffers: OfferRow[]
  skills: { id: string; name: string; slug: string; category: string | null }[]
  profileCompleteness: number
}

const STATUS_STYLES: Record<string, string> = {
  applied: "bg-muted text-muted-foreground",
  company_accepted: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  company_refused: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  admin_validated: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  admin_rejected: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  withdrawn: "bg-muted text-muted-foreground/60",
}

const STATUS_LABELS: Record<string, string> = {
  applied: "Pending",
  company_accepted: "Accepted",
  company_refused: "Refused",
  admin_validated: "Validated",
  admin_rejected: "Rejected",
  withdrawn: "Withdrawn",
}

function relativeTime(isoDate: string): string {
  const diff = Date.now() - new Date(isoDate).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days < 30) return `${days}d ago`
  return `${Math.floor(days / 30)}mo ago`
}

export function StudentDashboard({
  user,
  data,
}: {
  user: { name: string | null; email: string; role: string | null | undefined }
  data: StudentDashboardData
}) {
  const t = useTranslations("dashboard.student")

  const stats = [
    {
      title: t("stats.applications"),
      value: String(data.stats.totalApplications),
      description: `${data.stats.pendingApplications} pending`,
      icon: Briefcase,
    },
    {
      title: "Accepted",
      value: String(data.stats.acceptedApplications),
      description: "Accepted applications",
      icon: CheckCircle2,
    },
    {
      title: t("skillsSection"),
      value: String(data.stats.skillsCount),
      description: `${data.stats.skillsCount >= 3 ? "Profile boosted" : "Add more skills"}`,
      icon: Wrench,
    },
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
            Profile Strength: {data.profileCompleteness}%
          </Badge>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold leading-tight">
            Ready to secure your{" "}
            <span className="text-primary italic">dream internship</span>,{" "}
            {user.name?.split(" ")[0]}?
          </h2>
          <p className="text-white/60 text-sm font-light leading-relaxed">
            {data.profileCompleteness < 100
              ? "Complete your profile to stand out to recruiters and unlock more opportunities."
              : "Your profile is complete! Keep exploring opportunities and applying."}
          </p>
          <div className="flex flex-wrap gap-4 pt-4">
            {data.profileCompleteness < 100 && (
              <Link href="/dashboard/profile">
                <Button
                  variant="editorial"
                  size="editorial"
                  className="bg-primary border-primary text-white hover:bg-white hover:text-heading"
                >
                  Complete Profile
                </Button>
              </Link>
            )}
            <Link href="/dashboard/explore">
              <Button
                variant="editorial-outline"
                size="editorial"
                className="border-white/20 text-white hover:bg-white/10"
              >
                Explore Internships
              </Button>
            </Link>
          </div>
        </div>
        {/* Background Decor */}
        <div className="absolute top-0 end-0 w-64 h-64 bg-primary/20 blur-[100px] rounded-full translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 start-0 w-48 h-48 bg-primary/10 blur-[80px] rounded-full -translate-x-1/2 translate-y-1/2" />
      </motion.div>

      {/* ── Stats Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <StatsCard key={i} index={i} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Feed: Recent Applications */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-2xl font-bold text-heading">
              Recent Applications
            </h2>
            <Link href="/dashboard/applications">
              <Button
                variant="ghost"
                size="sm"
                className="text-primary hover:text-primary/80 group text-xs font-bold uppercase tracking-widest"
              >
                View All{" "}
                <ArrowRight className="h-4 w-4 ms-2 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>

          {data.recentApplications.length > 0 ? (
            <div className="space-y-4">
              {data.recentApplications.map((app) => (
                <Card
                  key={app.id}
                  className="group hover:ring-1 hover:ring-primary/20 transition-all cursor-pointer border-border/50 bg-background hover:bg-secondary/5 shadow-sm"
                >
                  <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-serif font-bold text-primary">
                            {app.companyName}
                          </span>
                          <span className="h-1 w-1 rounded-full bg-border" />
                          {app.offerWilayaCode && (
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <MapPin className="h-3 w-3" />{" "}
                              {getWilayaName(app.offerWilayaCode)}
                            </span>
                          )}
                        </div>
                        <h3 className="text-lg font-bold leading-tight group-hover:text-primary transition-colors">
                          {app.offerTitle}
                        </h3>
                      </div>
                      <div className="flex flex-col items-start sm:items-end justify-between gap-3 shrink-0">
                        <Badge
                          className={`border-none text-[9px] font-bold uppercase tracking-[0.2em] px-3 py-1 rounded-none ${STATUS_STYLES[app.status] ?? ""}`}
                        >
                          {STATUS_LABELS[app.status] ?? app.status}
                        </Badge>
                        <span className="text-[10px] text-muted-foreground flex items-center gap-1.5 uppercase tracking-wider font-medium">
                          <Calendar className="h-3.5 w-3.5" />{" "}
                          {relativeTime(app.createdAt)}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="border-border/40 bg-background rounded-2xl shadow-sm">
              <CardContent className="p-10 text-center space-y-4">
                <div className="inline-flex items-center justify-center p-4 rounded-2xl bg-secondary/10">
                  <Briefcase className="h-6 w-6 text-muted-foreground/30" />
                </div>
                <p className="text-sm text-muted-foreground/60 font-medium max-w-xs mx-auto leading-relaxed">
                  You haven&apos;t applied to any internships yet. Start
                  exploring opportunities!
                </p>
                <Link href="/dashboard/explore">
                  <Button
                    variant="editorial"
                    size="editorial-sm"
                    className="rounded-xl border-primary bg-primary text-white hover:bg-primary/90"
                  >
                    <Search className="h-4 w-4 me-2" /> Explore Internships
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}

          {/* Recommended Offers */}
          {data.recommendedOffers.length > 0 && (
            <div className="space-y-6 pt-4">
              <div className="flex items-center justify-between">
                <h2 className="font-serif text-2xl font-bold text-heading">
                  {t("recentOffers")}
                </h2>
                <Link href="/dashboard/explore">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-primary hover:text-primary/80 group text-xs font-bold uppercase tracking-widest"
                  >
                    Explore All{" "}
                    <ArrowRight className="h-4 w-4 ms-2 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
              </div>
              <div className="space-y-4">
                {data.recommendedOffers.map((offer) => (
                  <Link
                    key={offer.id}
                    href={`/dashboard/explore/${offer.id}`}
                  >
                    <Card className="group hover:ring-1 hover:ring-primary/20 transition-all cursor-pointer border-border/50 bg-background hover:bg-secondary/5 shadow-sm">
                      <CardContent className="p-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-serif font-bold text-primary">
                                {offer.companyName}
                              </span>
                              <span className="h-1 w-1 rounded-full bg-border" />
                              {offer.wilayaCode && (
                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />{" "}
                                  {getWilayaName(offer.wilayaCode)}
                                </span>
                              )}
                            </div>
                            <h3 className="text-lg font-bold leading-tight group-hover:text-primary transition-colors">
                              {offer.title}
                            </h3>
                            {offer.skills.length > 0 && (
                              <div className="flex flex-wrap gap-2 pt-1">
                                {offer.skills.slice(0, 5).map((skill) => (
                                  <Badge
                                    key={skill.id}
                                    variant="secondary"
                                    className="bg-secondary/50 text-[9px] uppercase font-bold tracking-wider rounded-none px-2 py-0.5 border-none"
                                  >
                                    {skill.name}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                          <div className="flex flex-col items-start sm:items-end justify-between gap-3 shrink-0">
                            <Badge className="bg-heading text-white border-none text-[9px] font-bold uppercase tracking-[0.2em] px-3 py-1 rounded-none italic">
                              {offer.internshipType.toUpperCase()}
                            </Badge>
                            <span className="text-[10px] text-muted-foreground flex items-center gap-1.5 uppercase tracking-wider font-medium">
                              <Calendar className="h-3.5 w-3.5" />{" "}
                              {relativeTime(offer.createdAt)}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar: Skills */}
        <div className="lg:col-span-4 space-y-8">
          <section className="space-y-4">
            <h2 className="font-serif text-xl font-bold text-heading">
              {t("skillsSection")}
            </h2>
            <Card className="bg-background border-border/40 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all">
              <CardContent className="p-6">
                {data.skills.length > 0 ? (
                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                      {data.skills.map((skill) => (
                        <Badge
                          key={skill.id}
                          variant="secondary"
                          className="bg-primary/5 text-primary text-[10px] uppercase font-bold tracking-wider rounded-full px-3 py-1 border-none"
                        >
                          {skill.name}
                        </Badge>
                      ))}
                    </div>
                    <Link href="/dashboard/profile">
                      <Button
                        variant="editorial-outline"
                        size="editorial-sm"
                        className="w-full mt-4 text-[9px] h-10 border-border/60 hover:border-primary"
                      >
                        Manage Skills{" "}
                        <ExternalLink className="h-3.5 w-3.5 ms-2" />
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="text-center py-6 space-y-3">
                    <div className="inline-flex items-center justify-center p-3 rounded-xl bg-secondary/10">
                      <Wrench className="h-5 w-5 text-muted-foreground/40" />
                    </div>
                    <p className="text-xs text-muted-foreground/60 font-medium max-w-[200px] mx-auto leading-relaxed">
                      Add your technical skills to stand out to recruiters
                    </p>
                    <Link href="/dashboard/profile">
                      <Button
                        variant="editorial-outline"
                        size="editorial-sm"
                        className="border-border/40 hover:border-primary mt-2"
                      >
                        Add Skills
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </section>
        </div>
      </div>
    </div>
  )
}
