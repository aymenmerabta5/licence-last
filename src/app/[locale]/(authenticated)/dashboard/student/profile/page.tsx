import { redirect } from "next/navigation"
import { getTranslations } from "next-intl/server"
import {
  Github,
  Globe,
  Mail,
  Phone,
  MapPin,
  GraduationCap,
  Hash,
  Pencil,
} from "lucide-react"

import { requireRole } from "@/lib/auth-guards"
import { getStudentProfile } from "@/server/services/students/get-profile"
import { Link } from "@/i18n/routing"

export default async function StudentProfilePage() {
  const sessionUser = await requireRole(["student"])
  const t = await getTranslations("dashboard.student.profile")

  const data = await getStudentProfile(sessionUser.id)

  if (!data) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    redirect("/onboarding/student" as any)
  }

  const { profile, user, skills } = data

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* ── Header ── */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <h1 className="font-serif text-3xl text-heading tracking-tight">
            {t("title")}
          </h1>
          <p className="text-sm text-muted-foreground font-light">
            {t("subtitle")}
          </p>
        </div>
        <Link
          href="/onboarding/student"
          className="inline-flex items-center gap-2 px-4 py-2 text-sm border border-border hover:border-primary/30 hover:text-primary transition-colors"
        >
          <Pencil className="h-3.5 w-3.5" />
          {t("edit")}
        </Link>
      </div>

      {/* ── Personal Info Card ── */}
      <section className="border border-border p-6 space-y-4">
        <h2 className="text-[11px] font-semibold tracking-[0.15em] uppercase text-muted-foreground border-b border-border pb-2">
          {t("personalInfo")}
        </h2>

        <div className="grid gap-4 sm:grid-cols-2">
          {user?.name && (
            <div className="flex items-center gap-3">
              <GraduationCap className="h-4 w-4 text-muted-foreground/60 shrink-0" />
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{t("name")}</p>
                <p className="text-sm">{user.name}</p>
              </div>
            </div>
          )}

          {user?.email && (
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-muted-foreground/60 shrink-0" />
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{t("email")}</p>
                <p className="text-sm">{user.email}</p>
              </div>
            </div>
          )}

          {profile.phone && (
            <div className="flex items-center gap-3">
              <Phone className="h-4 w-4 text-muted-foreground/60 shrink-0" />
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{t("phone")}</p>
                <p className="text-sm">{profile.phone}</p>
              </div>
            </div>
          )}

          {profile.studentNumber && (
            <div className="flex items-center gap-3">
              <Hash className="h-4 w-4 text-muted-foreground/60 shrink-0" />
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{t("studentNumber")}</p>
                <p className="text-sm">{profile.studentNumber}</p>
              </div>
            </div>
          )}

          {profile.department && (
            <div className="flex items-center gap-3">
              <GraduationCap className="h-4 w-4 text-muted-foreground/60 shrink-0" />
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{t("department")}</p>
                <p className="text-sm">{profile.department}</p>
              </div>
            </div>
          )}

          {profile.level && (
            <div className="flex items-center gap-3">
              <GraduationCap className="h-4 w-4 text-muted-foreground/60 shrink-0" />
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{t("level")}</p>
                <p className="text-sm">{profile.level}</p>
              </div>
            </div>
          )}
        </div>

        {profile.bio && (
          <div className="pt-2">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">{t("bio")}</p>
            <p className="text-sm text-muted-foreground leading-relaxed">{profile.bio}</p>
          </div>
        )}
      </section>

      {/* ── Location Card ── */}
      {(profile.wilayaCode || profile.address) && (
        <section className="border border-border p-6 space-y-4">
          <h2 className="text-[11px] font-semibold tracking-[0.15em] uppercase text-muted-foreground border-b border-border pb-2">
            {t("location")}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {profile.wilayaCode && (
              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-muted-foreground/60 shrink-0" />
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{t("wilaya")}</p>
                  <p className="text-sm">
                    {String(profile.wilayaCode).padStart(2, "0")} — Wilaya
                  </p>
                </div>
              </div>
            )}
            {profile.address && (
              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-muted-foreground/60 shrink-0" />
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{t("address")}</p>
                  <p className="text-sm">{profile.address}</p>
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── Links Card ── */}
      {(profile.githubUrl || profile.portfolioUrl) && (
        <section className="border border-border p-6 space-y-4">
          <h2 className="text-[11px] font-semibold tracking-[0.15em] uppercase text-muted-foreground border-b border-border pb-2">
            {t("links")}
          </h2>
          <div className="flex flex-wrap gap-4">
            {profile.githubUrl && (
              <a
                href={profile.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 text-sm border border-border hover:border-primary/30 hover:text-primary transition-colors"
              >
                <Github className="h-4 w-4" />
                GitHub
              </a>
            )}
            {profile.portfolioUrl && (
              <a
                href={profile.portfolioUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 text-sm border border-border hover:border-primary/30 hover:text-primary transition-colors"
              >
                <Globe className="h-4 w-4" />
                Portfolio
              </a>
            )}
          </div>
        </section>
      )}

      {/* ── Skills Card ── */}
      {skills.length > 0 && (
        <section className="border border-border p-6 space-y-4">
          <h2 className="text-[11px] font-semibold tracking-[0.15em] uppercase text-muted-foreground border-b border-border pb-2">
            {t("skills")}
          </h2>
          <div className="flex flex-wrap gap-2">
            {skills.map((skill) => (
              <span
                key={skill.id}
                className="inline-flex items-center px-3 py-1.5 text-xs bg-primary/10 border border-primary/30 text-primary font-medium"
              >
                {skill.name}
              </span>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
