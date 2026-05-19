"use client"

import {
  GraduationCap,
  Hash,
  Mail,
  MapPin,
  Phone,
  User,
} from "lucide-react"
import * as motion from "motion/react-client"
import type {
  ProfileContentProps,
  StudentProfile,
} from "@/app/[locale]/(authenticated)/dashboard/profile/_components/ProfileContent/types"
import { ease } from "@/lib/animations"

interface ContactInfoCardProps {
  user: ProfileContentProps["user"]
  profile: StudentProfile | null | undefined
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
  const infoItems = [
    { label: labels.email, value: user.email, icon: Mail },
    { label: labels.role, value: roleLabel, icon: User },
    {
      label: labels.location,
      value: profile?.address || labels.notSetYet,
      icon: MapPin,
      muted: !profile?.address,
    },
    {
      label: labels.phone,
      value: profile?.phone || labels.notSetYet,
      icon: Phone,
      muted: !profile?.phone,
    },
  ]

  if (profile?.studentNumber) {
    infoItems.push({
      label: labels.studentNumber,
      value: profile.studentNumber,
      icon: Hash,
    })
  }

  if (profile?.department) {
    infoItems.push({
      label: labels.department,
      value: profile.department,
      icon: GraduationCap,
    })
  }

  return (
    <motion.section
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.25, duration: 0.6, ease }}
      className="border border-border/50 bg-card overflow-hidden"
    >
      <div className="px-5 py-4 border-b border-border/20 bg-muted/30 flex items-center gap-2.5">
        <div className="h-4 w-1 rounded-full bg-primary" />
        <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-foreground">
          {labels.personalInfo}
        </h2>
      </div>

      <div className="divide-y divide-border/10">
        {infoItems.map((item, i) => (
          <div
            key={i}
            className="flex items-center gap-3 px-5 py-3.5"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted border border-border/20">
              <item.icon className="h-3.5 w-3.5 text-muted-foreground" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.1em]">
                {item.label}
              </p>
              <p
                className={`text-sm font-medium truncate ${
                  (item as { muted?: boolean }).muted
                    ? "text-muted-foreground/60"
                    : "text-foreground"
                }`}
              >
                {item.value}
              </p>
            </div>
          </div>
        ))}
      </div>
    </motion.section>
  )
}
