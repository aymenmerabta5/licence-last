"use client"

import * as motion from "motion/react-client"
import {
  Mail,
  MapPin,
  Github,
  Globe,
  Award,
  BookOpen,
  Briefcase,
  Edit3,
  ShieldCheck,
  Calendar,
  Phone,
  GraduationCap,
  Hash,
} from "lucide-react"
import { useTranslations } from "next-intl"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { StatsCard } from "@/app/[locale]/(authenticated)/_components/StatsCard"
import { Link } from "@/i18n/routing"
import { getWilayaName } from "@/lib/wilayas"

interface StudentData {
  profile: {
    bio: string | null
    phone: string | null
    wilayaCode: number | null
    githubUrl: string | null
    portfolioUrl: string | null
    studentNumber: string | null
    department: string | null
    level: string | null
    address: string | null
  } | null
  skills: { id: string; name: string; slug: string; category: string | null }[]
  stats: {
    totalApplications: number
    skillsCount: number
    profileCompleteness: number
  }
  university: {
    id: string
    name: string
    abbreviation: string | null
    city: string | null
  } | null
}

interface ProfileContentProps {
  user: {
    name: string | null
    email: string
    role: string | null | undefined
    image: string | null | undefined
    createdAt: string
  }
  studentData?: StudentData
}

const roleLabels: Record<string, string> = {
  student: "Student",
  company_admin: "Recruiter",
  admin: "Administrator",
  super_admin: "Super Admin",
}

export function ProfileContent({ user, studentData }: ProfileContentProps) {
  const t = useTranslations("dashboard")

  const initials = user.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U"

  const memberSince = new Date(user.createdAt).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  })

  const isStudent = user.role === "student" && studentData
  const profile = studentData?.profile

  const stats = isStudent
    ? [
        {
          title: t("student.stats.applications"),
          value: String(studentData.stats.totalApplications),
          description: "Total submitted",
          icon: Briefcase,
        },
        {
          title: t("student.profile.skills"),
          value: String(studentData.stats.skillsCount),
          description: `${studentData.stats.skillsCount} skills added`,
          icon: Award,
        },
        {
          title: "Profile",
          value: `${studentData.stats.profileCompleteness}%`,
          description: studentData.stats.profileCompleteness === 100 ? "Complete!" : "Keep going",
          icon: ShieldCheck,
        },
      ]
    : [
        {
          title: "Profile Views",
          value: "—",
          description: "Coming soon",
          icon: Briefcase,
        },
        {
          title: "Applications",
          value: "—",
          description: "Coming soon",
          icon: Briefcase,
        },
        {
          title: "Skill Score",
          value: "—",
          description: "Coming soon",
          icon: Award,
        },
      ]

  const wilayaName = profile?.wilayaCode ? getWilayaName(profile.wilayaCode) : null

  return (
    <div className="space-y-10 pb-20">
      {/* ── Header / Cover Section ── */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="relative"
      >
        {/* Cover gradient */}
        <div className="h-44 sm:h-56 w-full rounded-2xl bg-gradient-to-br from-primary/15 via-primary/5 to-secondary/10 overflow-hidden relative">
          <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:20px_20px] opacity-[0.06]" />
          <div className="absolute top-8 end-8 w-56 h-56 bg-primary/10 blur-[100px] rounded-full" />
          <div className="absolute bottom-0 start-16 w-40 h-40 bg-secondary/10 blur-[80px] rounded-full" />

          <div className="absolute top-5 start-6">
            <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-muted-foreground/50">
              Profile Edition
            </span>
          </div>
        </div>

        {/* Avatar + Name bar */}
        <div className="px-6 sm:px-8 -mt-14 sm:-mt-18 relative z-10 flex flex-col sm:flex-row sm:items-end gap-5">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.4, type: "spring" }}
            className="h-28 w-28 sm:h-36 sm:w-36 rounded-full border-[6px] border-background bg-primary flex items-center justify-center text-white text-4xl sm:text-5xl font-serif shadow-2xl shadow-primary/20 shrink-0"
          >
            {user.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.image}
                alt={user.name || "Profile"}
                className="h-full w-full rounded-full object-cover"
              />
            ) : (
              initials
            )}
          </motion.div>

          <div className="flex-1 pb-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <h1 className="text-3xl sm:text-4xl font-serif font-bold text-heading tracking-tight leading-none">
                  {user.name || "Anonymous User"}
                </h1>
                <div className="flex items-center gap-3 mt-2">
                  <Badge className="bg-primary/10 text-primary border-none text-[9px] font-bold uppercase tracking-[0.2em] px-3 py-1 rounded-full">
                    {roleLabels[user.role || "student"] || user.role}
                  </Badge>
                  <span className="flex items-center gap-1.5 text-[10px] text-muted-foreground/60 uppercase tracking-wider font-medium">
                    <Calendar className="h-3 w-3" />
                    Member since {memberSince}
                  </span>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="flex gap-3"
              >
                <Link href="/dashboard/settings">
                  <Button
                    variant="editorial"
                    className="rounded-xl h-10 px-5 shadow-lg shadow-primary/15 border-primary bg-primary text-white hover:bg-primary/90"
                  >
                    <Edit3 className="h-4 w-4 me-2" /> {t("student.profile.edit")}
                  </Button>
                </Link>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* ── Stats Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <StatsCard key={i} index={i} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* ── Left Column: Info ── */}
        <div className="lg:col-span-4 space-y-8">
          {/* Contact Info Card */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-3"
          >
            <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground/50">
              {t("student.profile.personalInfo")}
            </h2>
            <Card className="bg-background border-border/40 rounded-2xl p-6 shadow-sm">
              <div className="space-y-5">
                {/* Email */}
                <div className="flex items-center gap-3.5">
                  <div className="p-2 rounded-lg bg-primary/5 text-primary">
                    <Mail className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground/50 font-bold mb-0.5">
                      {t("student.profile.email")}
                    </p>
                    <p className="text-sm font-bold text-heading truncate">
                      {user.email}
                    </p>
                  </div>
                </div>

                {/* Phone */}
                {isStudent && (
                  <>
                    <div className="h-px bg-border/20" />
                    <div className="flex items-center gap-3.5">
                      <div className="p-2 rounded-lg bg-primary/5 text-primary">
                        <Phone className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground/50 font-bold mb-0.5">
                          {t("student.profile.phone")}
                        </p>
                        <p className={`text-sm ${profile?.phone ? "font-bold text-heading" : "text-muted-foreground font-medium italic"}`}>
                          {profile?.phone || "Not set yet"}
                        </p>
                      </div>
                    </div>
                  </>
                )}

                <div className="h-px bg-border/20" />

                {/* Role */}
                <div className="flex items-center gap-3.5">
                  <div className="p-2 rounded-lg bg-primary/5 text-primary">
                    <ShieldCheck className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground/50 font-bold mb-0.5">
                      Role
                    </p>
                    <p className="text-sm font-bold text-heading">
                      {roleLabels[user.role || "student"] || user.role}
                    </p>
                  </div>
                </div>

                <div className="h-px bg-border/20" />

                {/* Location */}
                <div className="flex items-center gap-3.5">
                  <div className="p-2 rounded-lg bg-primary/5 text-primary">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground/50 font-bold mb-0.5">
                      {t("student.profile.location")}
                    </p>
                    <p className={`text-sm ${wilayaName ? "font-bold text-heading" : "text-muted-foreground font-medium italic"}`}>
                      {wilayaName || "Not set yet"}
                    </p>
                  </div>
                </div>

                {/* Student-specific info */}
                {isStudent && profile?.studentNumber && (
                  <>
                    <div className="h-px bg-border/20" />
                    <div className="flex items-center gap-3.5">
                      <div className="p-2 rounded-lg bg-primary/5 text-primary">
                        <Hash className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground/50 font-bold mb-0.5">
                          {t("student.profile.studentNumber")}
                        </p>
                        <p className="text-sm font-bold text-heading">
                          {profile.studentNumber}
                        </p>
                      </div>
                    </div>
                  </>
                )}

                {isStudent && profile?.department && (
                  <>
                    <div className="h-px bg-border/20" />
                    <div className="flex items-center gap-3.5">
                      <div className="p-2 rounded-lg bg-primary/5 text-primary">
                        <GraduationCap className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground/50 font-bold mb-0.5">
                          {t("student.profile.department")}
                        </p>
                        <p className="text-sm font-bold text-heading">
                          {profile.department}
                          {profile.level && ` — ${profile.level}`}
                        </p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </Card>
          </motion.section>

          {/* Skills */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-3"
          >
            <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground/50">
              {t("student.profile.skills")}
            </h2>
            <Card className="bg-background border-border/40 rounded-2xl p-6 shadow-sm">
              {isStudent && studentData.skills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {studentData.skills.map((skill) => (
                    <Badge
                      key={skill.id}
                      variant="secondary"
                      className="bg-primary/5 text-primary text-[10px] uppercase font-bold tracking-wider rounded-full px-3 py-1 border-none"
                    >
                      {skill.name}
                    </Badge>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 space-y-3">
                  <div className="inline-flex items-center justify-center p-3 rounded-xl bg-secondary/10">
                    <Award className="h-5 w-5 text-muted-foreground/40" />
                  </div>
                  <p className="text-xs text-muted-foreground/60 font-medium max-w-[200px] mx-auto leading-relaxed">
                    Add your technical skills to stand out to recruiters
                  </p>
                  <Link href="/dashboard/settings">
                    <Button
                      variant="editorial-outline"
                      size="editorial-sm"
                      className="rounded-xl border-border/40 hover:border-primary mt-2"
                    >
                      Add Skills
                    </Button>
                  </Link>
                </div>
              )}
            </Card>
          </motion.section>

          {/* Social Connect */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-3"
          >
            <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground/50">
              {t("student.profile.links")}
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {profile?.githubUrl ? (
                <a
                  href={profile.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="contents"
                >
                  <Button
                    variant="editorial-outline"
                    className="justify-start gap-3 rounded-xl border-border/40 hover:border-heading dark:hover:border-white h-11"
                  >
                    <Github className="h-4 w-4" /> GitHub
                  </Button>
                </a>
              ) : (
                <Button
                  variant="editorial-outline"
                  className="justify-start gap-3 rounded-xl border-border/40 text-muted-foreground/50 h-11"
                  disabled
                >
                  <Github className="h-4 w-4" /> GitHub
                </Button>
              )}
              {profile?.portfolioUrl ? (
                <a
                  href={profile.portfolioUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="contents"
                >
                  <Button
                    variant="editorial-outline"
                    className="justify-start gap-3 rounded-xl border-border/40 hover:border-primary col-span-1 h-11"
                  >
                    <Globe className="h-4 w-4" /> Portfolio
                  </Button>
                </a>
              ) : (
                <Button
                  variant="editorial-outline"
                  className="justify-start gap-3 rounded-xl border-border/40 text-muted-foreground/50 h-11"
                  disabled
                >
                  <Globe className="h-4 w-4" /> Portfolio
                </Button>
              )}
            </div>
          </motion.section>
        </div>

        {/* ── Right Column: Bio & Education ── */}
        <div className="lg:col-span-8 space-y-10">
          {/* Bio / About */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-2xl font-bold text-heading">
                {t("student.profile.bio")}
              </h2>
            </div>
            <Card className="p-6 border-border/40 bg-background rounded-2xl shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 end-0 w-32 h-32 bg-primary/[0.02] blur-[60px] rounded-full group-hover:bg-primary/[0.05] transition-colors duration-500" />
              <div className="relative">
                {isStudent && profile?.bio ? (
                  <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">
                    {profile.bio}
                  </p>
                ) : (
                  <>
                    <p className="text-sm text-muted-foreground italic leading-relaxed">
                      No bio added yet. Tell companies and recruiters about yourself, your interests,
                      and what kind of internship you are looking for.
                    </p>
                    <Link href="/dashboard/settings" className="inline-block mt-4">
                      <Button
                        variant="editorial-outline"
                        size="editorial-sm"
                        className="rounded-xl border-border/40 hover:border-primary"
                      >
                        <Edit3 className="h-3.5 w-3.5 me-2" /> Write your bio
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </Card>
          </motion.section>

          {/* Education / University */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-4"
          >
            <h2 className="font-serif text-2xl font-bold text-heading">Education</h2>
            <Card className="p-6 border-transparent bg-secondary/[0.03] hover:bg-secondary/[0.06] rounded-2xl flex items-start gap-5 group transition-all">
              <div className="h-12 w-12 rounded-xl bg-white dark:bg-card border border-border/20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1 space-y-2">
                {isStudent && studentData.university ? (
                  <div className="space-y-1">
                    <p className="text-base font-bold text-heading">
                      {studentData.university.name}
                      {studentData.university.abbreviation && (
                        <span className="text-muted-foreground font-normal ms-2">
                          ({studentData.university.abbreviation})
                        </span>
                      )}
                    </p>
                    {(profile?.department || profile?.level) && (
                      <p className="text-sm text-muted-foreground">
                        {[profile.department, profile.level].filter(Boolean).join(" — ")}
                      </p>
                    )}
                    {studentData.university.city && (
                      <p className="text-xs text-muted-foreground/60 flex items-center gap-1">
                        <MapPin className="h-3 w-3" /> {studentData.university.city}
                      </p>
                    )}
                  </div>
                ) : (
                  <>
                    <p className="text-sm text-muted-foreground italic">
                      Your education history will appear here once you complete your profile.
                    </p>
                    <Link href="/dashboard/settings">
                      <Button
                        variant="editorial-outline"
                        size="editorial-sm"
                        className="rounded-xl border-border/40 hover:border-primary"
                      >
                        Add Education
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </Card>
          </motion.section>

          {/* Experience placeholder */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-2xl font-bold text-heading">Experience</h2>
              <ShieldCheck className="h-5 w-5 text-green-500/50" />
            </div>
            <Card className="p-8 border-border/40 bg-background rounded-2xl shadow-sm text-center">
              <div className="space-y-3 max-w-xs mx-auto">
                <div className="inline-flex items-center justify-center p-4 rounded-2xl bg-secondary/10">
                  <Briefcase className="h-6 w-6 text-muted-foreground/30" />
                </div>
                <p className="text-xs text-muted-foreground/60 font-medium leading-relaxed">
                  Add your work experience, open source contributions, or personal projects
                  to strengthen your profile.
                </p>
                <Link href="/dashboard/settings">
                  <Button
                    variant="editorial-outline"
                    size="editorial-sm"
                    className="rounded-xl border-border/40 hover:border-primary mt-2"
                  >
                    Add Experience
                  </Button>
                </Link>
              </div>
            </Card>
          </motion.section>
        </div>
      </div>
    </div>
  )
}
