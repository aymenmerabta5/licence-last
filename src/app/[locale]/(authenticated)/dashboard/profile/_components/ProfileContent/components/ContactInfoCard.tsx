"use client"

import {
  GraduationCap,
  Hash,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  User,
} from "lucide-react"
import * as motion from "motion/react-client"
import type {
  ProfileUser,
  StudentProfile,
} from "@/app/[locale]/(authenticated)/dashboard/profile/_components/ProfileContent/types"
import { ease } from "@/lib/animations"
import { getWilayaName } from "@/lib/wilayas"

interface ContactInfoCardProps {
  user: ProfileUser
  profile?: StudentProfile | null
  roleLabel: string
  labels: {
    personalInfo: string
    email: string
    phone: string
    location: string
    studentNumber: string
    department: string
    role: string
    notSetYet: string
  }
}

export function ContactInfoCard({
  user,
  profile,
  roleLabel,
  labels,
}: ContactInfoCardProps) {
  const wilayaName = profile?.wilayaCode
    ? getWilayaName(profile.wilayaCode)
    : null

  const rows = [
    { key: "email", icon: Mail, label: labels.email, value: user.email },
    { key: "phone", icon: Phone, label: labels.phone, value: profile?.phone },
    { key: "role", icon: ShieldCheck, label: labels.role, value: roleLabel },
    {
      key: "location",
      icon: MapPin,
      label: labels.location,
      value: wilayaName,
      placeholder: labels.notSetYet,
    },
    {
      key: "studentNumber",
      icon: Hash,
      label: labels.studentNumber,
      value: profile?.studentNumber,
    },
    {
      key: "department",
      icon: GraduationCap,
      label: labels.department,
      value: profile?.department
        ? profile.level
          ? `${profile.department} — ${profile.level}`
          : profile.department
        : null,
    },
  ].filter((row) => row.value || row.placeholder)

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.6, ease }}
      className="border border-border/60 bg-card/30 dark:bg-card/50 overflow-hidden"
    >
      {/* Section header */}
      <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-border/40 bg-muted/20 dark:bg-muted/10">
        <User className="h-4 w-4 text-primary" />
        <h2 className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
          {labels.personalInfo}
        </h2>
      </div>

      {/* Contact rows */}
      <div className="divide-y divide-border/20">
        {rows.map((row, idx) => {
          const Icon = row.icon
          const hasValue = !!row.value

          return (
            <motion.div
              key={row.key}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.25 + idx * 0.04, duration: 0.4, ease }}
              className="flex items-center gap-3.5 px-5 py-4 transition-colors hover:bg-primary/[0.02] group"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center border border-border/50 bg-muted/30 group-hover:border-primary/30 group-hover:bg-primary/5 transition-colors">
                <Icon className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[9px] uppercase tracking-[0.15em] text-muted-foreground/50 font-bold mb-0.5">
                  {row.label}
                </p>
                <p
                  className={
                    hasValue
                      ? "text-sm font-medium text-heading truncate"
                      : "text-sm text-muted-foreground/40 font-medium italic truncate"
                  }
                >
                  {row.value || row.placeholder}
                </p>
              </div>
            </motion.div>
          )
        })}
      </div>
    </motion.section>
  )
}
