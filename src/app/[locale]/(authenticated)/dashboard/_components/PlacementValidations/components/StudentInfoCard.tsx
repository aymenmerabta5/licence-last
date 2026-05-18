"use client"

import { GraduationCap, Mail, MapPin, Phone } from "lucide-react"
import * as motion from "motion/react-client"
import Image from "next/image"
import { useTranslations } from "next-intl"

import { InfoRow } from "@/app/[locale]/(authenticated)/dashboard/_components/PlacementValidations/components/InfoRow"
import type { ValidationDetailData } from "@/app/[locale]/(authenticated)/dashboard/_components/PlacementValidations/types"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
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
  title,
  titleIcon,
}: {
  children: React.ReactNode
  className?: string
  title?: string
  titleIcon?: React.ReactNode
}) {
  return (
    <div className={cn("space-y-3", className)}>
      {title && (
        <div className="flex items-center gap-2">
          {titleIcon && (
            <span className="text-muted-foreground/70">{titleIcon}</span>
          )}
          <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
            {title}
          </h3>
        </div>
      )}
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
      <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-full ring-1 ring-border ring-offset-2 ring-offset-background overflow-hidden bg-muted flex items-center justify-center">
        {image ? (
          <Image
            src={image}
            alt={name || "Student"}
            fill
            className="object-cover"
            sizes="96px"
          />
        ) : (
          <span className="text-foreground/50 text-xl sm:text-2xl font-serif tracking-tighter">
            {initials}
          </span>
        )}
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
      className="relative overflow-hidden border border-border/60 bg-background"
    >
      <div className="relative p-6 sm:p-8 space-y-8">
        {/* Header with avatar */}
        <div className="flex flex-col items-center text-center sm:flex-row sm:items-start sm:text-start gap-5">
          <StudentAvatar
            image={application.student.image}
            name={application.student.name}
          />
          <div className="space-y-2 pt-0.5">
            <div className="space-y-1">
              <h2 className="font-serif text-xl sm:text-2xl font-semibold text-heading tracking-tight">
                {application.student.name}
              </h2>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                {t("studentInfo")}
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                <Mail className="h-3 w-3 text-primary/60" />
                {application.student.email}
              </span>
            </div>
          </div>
        </div>

        <Separator className="bg-border/40" />

        {/* Core info */}
        <Section title={t("studentInfo")}>
          <div className="grid gap-y-2 gap-x-6 sm:grid-cols-2">
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
        </Section>

        {application.university && (
          <>
            <Separator className="bg-border/40" />
            <Section
              title={t("university")}
              titleIcon={
                <GraduationCap className="h-3.5 w-3.5 text-primary/60" />
              }
            >
              <div className="grid gap-y-2 gap-x-6 sm:grid-cols-2">
                <InfoRow
                  label={t("name")}
                  value={application.university.name}
                />
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
          </>
        )}

        {application.skills.length > 0 && (
          <>
            <Separator className="bg-border/40" />
            <Section title={t("skills")}>
              <div className="flex flex-wrap gap-2">
                {application.skills.map((skill) => (
                  <Badge
                    key={skill.id}
                    variant="editorial-muted"
                    className="text-[10px]"
                  >
                    {skill.name}
                  </Badge>
                ))}
              </div>
            </Section>
          </>
        )}
      </div>
    </motion.div>
  )
}
