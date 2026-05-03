"use client"

import { GraduationCap, Mail, MapPin, Phone } from "lucide-react"
import * as motion from "motion/react-client"
import { useTranslations } from "next-intl"

import { InfoRow } from "@/app/[locale]/(authenticated)/dashboard/_components/PlacementValidations/components/InfoRow"
import type { ValidationDetailData } from "@/app/[locale]/(authenticated)/dashboard/_components/PlacementValidations/types"
import { ease, reveal } from "@/lib/animations"
import { cn } from "@/lib/utils"

interface StudentInfoCardProps {
  application: ValidationDetailData
}

function InitialsAvatar({ name }: { name: string | null }) {
  const initials = (name ?? "U")
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()

  return (
    <div className="flex h-12 w-12 shrink-0 items-center justify-center border border-border/60 bg-primary/5 text-primary">
      <span className="font-serif text-sm font-semibold">{initials}</span>
    </div>
  )
}

function Section({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn("border-t border-border/60 pt-4", className)}>
      {children}
    </div>
  )
}

export function StudentInfoCard({ application }: StudentInfoCardProps) {
  const t = useTranslations("dashboard.admin.validations.detail")

  return (
    <motion.div
      {...reveal}
      transition={{ duration: 0.5, ease, delay: 0.1 }}
      className="space-y-5 border border-border bg-background p-6"
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <InitialsAvatar name={application.student.name} />
        <div>
          <h2 className="font-serif text-lg font-semibold text-heading">
            {application.student.name}
          </h2>
          <p className="text-xs text-muted-foreground">{t("studentInfo")}</p>
        </div>
      </div>

      {/* Core info */}
      <div className="space-y-1">
        <InfoRow
          label={t("email")}
          value={application.student.email}
          icon={<Mail className="h-3.5 w-3.5" />}
        />
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
          <h3 className="mb-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            <GraduationCap className="h-3.5 w-3.5" />
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
          <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            {t("skills")}
          </h3>
          <div className="flex flex-wrap gap-2">
            {application.skills.map((skill) => (
              <span
                key={skill.id}
                className="inline-flex items-center border border-border bg-muted/30 px-2.5 py-1 text-[11px] font-medium text-foreground"
              >
                {skill.name}
              </span>
            ))}
          </div>
        </Section>
      )}
    </motion.div>
  )
}
