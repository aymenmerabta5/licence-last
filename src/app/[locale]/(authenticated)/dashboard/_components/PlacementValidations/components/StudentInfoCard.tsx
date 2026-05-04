"use client"

import { GraduationCap, Mail, MapPin, Phone, User } from "lucide-react"
import * as motion from "motion/react-client"
import { useTranslations } from "next-intl"
import Image from "next/image"

import { InfoRow } from "@/app/[locale]/(authenticated)/dashboard/_components/PlacementValidations/components/InfoRow"
import type { ValidationDetailData } from "@/app/[locale]/(authenticated)/dashboard/_components/PlacementValidations/types"
import { ease, reveal } from "@/lib/animations"
import { cn } from "@/lib/utils"

interface StudentInfoCardProps {
  application: ValidationDetailData
}

function getInitials(name: string | null) {
  return (name ?? "U")
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()
}

function Section({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn("border-t border-border/40 pt-4", className)}>
      {children}
    </div>
  )
}

function StudentAvatar({
  image,
  name,
}: {
  image: string | null
  name: string | null
}) {
  const initials = getInitials(name)

  return (
    <div className="relative shrink-0">
      <div className="h-24 w-24 sm:h-28 sm:w-28 rounded-full p-[3px] bg-gradient-to-tr from-primary/30 via-primary/10 to-transparent">
        <div className="h-full w-full rounded-full overflow-hidden bg-muted flex items-center justify-center border-[3px] border-background shadow-xl relative">
          {image ? (
            <Image
              src={image}
              alt={name || "Student"}
              fill
              className="object-cover"
              sizes="112px"
            />
          ) : (
            <span className="text-foreground/60 text-2xl sm:text-3xl font-serif tracking-tighter">
              {initials}
            </span>
          )}
        </div>
      </div>
      <div className="absolute -bottom-1 -end-1 h-8 w-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center shadow-lg border-2 border-background">
        <User className="h-4 w-4" />
      </div>
    </div>
  )
}

export function StudentInfoCard({ application }: StudentInfoCardProps) {
  const t = useTranslations("dashboard.admin.validations.detail")

  return (
    <motion.div
      {...reveal}
      transition={{ duration: 0.5, ease, delay: 0.1 }}
      className="group relative overflow-hidden border border-border bg-background"
    >
      {/* Top accent band */}
      <div className="absolute top-0 start-0 w-full h-1 bg-gradient-to-r from-primary/20 via-primary/50 to-primary/20" />

      {/* Subtle background watermark initial */}
      <div className="absolute top-4 end-4 text-[8rem] font-serif font-bold text-primary/[0.04] leading-none select-none pointer-events-none hidden sm:block">
        {getInitials(application.student.name).charAt(0)}
      </div>

      <div className="relative p-6 sm:p-8 space-y-6">
        {/* Header with avatar */}
        <div className="flex flex-col items-center text-center sm:flex-row sm:items-start sm:text-start gap-5">
          <StudentAvatar
            image={application.student.image}
            name={application.student.name}
          />
          <div className="space-y-1 pt-1">
            <h2 className="font-serif text-xl sm:text-2xl font-semibold text-heading tracking-tight">
              {application.student.name}
            </h2>
            <p className="text-xs font-medium uppercase tracking-[0.15em] text-muted-foreground">
              {t("studentInfo")}
            </p>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/5 border border-primary/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary/80">
                <Mail className="h-3 w-3" />
                {application.student.email}
              </span>
            </div>
          </div>
        </div>

        {/* Core info */}
        <div className="space-y-1">
          {application.profile?.phone && (
            <InfoRow
              label={t("phone")}
              value={application.profile.phone}
              icon={<Phone className="h-3.5 w-3.5" />}
            />
          )}
          {application.profile?.studentNumber && (
            <InfoRow
              label={t("studentNumber")}
              value={application.profile.studentNumber}
            />
          )}
          {application.profile?.department && (
            <InfoRow
              label={t("department")}
              value={application.profile.department}
            />
          )}
          {application.profile?.level && (
            <InfoRow label={t("level")} value={application.profile.level} />
          )}
        </div>

        {application.university && (
          <Section>
            <h3 className="mb-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
              <GraduationCap className="h-3.5 w-3.5 text-primary/60" />
              {t("university")}
            </h3>
            <div className="space-y-1">
              <InfoRow label={t("name")} value={application.university.name} />
              {application.university.departmentName && (
                <InfoRow
                  label={t("department")}
                  value={application.university.departmentName}
                />
              )}
              {application.university.address && (
                <InfoRow
                  label={t("address")}
                  value={application.university.address}
                  icon={<MapPin className="h-3.5 w-3.5" />}
                />
              )}
            </div>
          </Section>
        )}

        {application.skills.length > 0 && (
          <Section>
            <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
              {t("skills")}
            </h3>
            <div className="flex flex-wrap gap-2">
              {application.skills.map((skill) => (
                <span
                  key={skill.id}
                  className="inline-flex items-center rounded-full border border-border bg-muted/30 px-3 py-1 text-[11px] font-medium text-foreground transition-colors group-hover:bg-muted/50"
                >
                  {skill.name}
                </span>
              ))}
            </div>
          </Section>
        )}
      </div>
    </motion.div>
  )
}
