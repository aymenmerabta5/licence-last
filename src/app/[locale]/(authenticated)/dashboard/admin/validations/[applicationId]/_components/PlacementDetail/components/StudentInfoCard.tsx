"use client"

import { GraduationCap, Mail, MapPin, Phone, User } from "lucide-react"
import * as motion from "motion/react-client"
import { useTranslations } from "next-intl"
import { InfoRow } from "@/app/[locale]/(authenticated)/dashboard/admin/validations/[applicationId]/_components/PlacementDetail/components/InfoRow"
import { ease, reveal } from "@/lib/animations"

interface StudentInfoCardProps {
  application: {
    student: { name: string | null; email: string }
    profile: {
      phone?: string | null
      studentNumber?: string | null
      department?: string | null
      level?: string | null
    } | null
    university: {
      name: string
      abbreviation?: string | null
      departmentName?: string | null
      address?: string | null
    } | null
    skills: { id: string; name: string; category?: string | null }[]
  }
}

export function StudentInfoCard({ application }: StudentInfoCardProps) {
  const t = useTranslations("dashboard.admin.validations.detail")

  return (
    <motion.div
      {...reveal}
      transition={{ duration: 0.5, ease, delay: 0.1 }}
      className="border border-border p-6 space-y-4"
    >
      <h2 className="font-serif text-lg text-heading flex items-center gap-2">
        <User className="h-4 w-4" />
        {t("studentInfo")}
      </h2>
      <div className="space-y-3 text-sm">
        <InfoRow label={t("name")} value={application.student.name} />
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
        <div className="pt-4 border-t border-border space-y-3">
          <h3 className="font-medium text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-2">
            <GraduationCap className="h-3.5 w-3.5" />
            {t("university")}
          </h3>
          <div className="space-y-2 text-sm">
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
        </div>
      )}

      {application.skills.length > 0 && (
        <div className="pt-4 border-t border-border">
          <h3 className="font-medium text-xs uppercase tracking-wider text-muted-foreground mb-3">
            {t("skills")}
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {application.skills.map((skill) => (
              <span
                key={skill.id}
                className="inline-flex items-center px-2 py-0.5 text-[10px] bg-primary/10 border border-primary/20 text-primary"
              >
                {skill.name}
              </span>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  )
}
