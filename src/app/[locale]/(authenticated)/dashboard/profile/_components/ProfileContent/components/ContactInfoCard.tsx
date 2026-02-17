"use client"

import * as motion from "motion/react-client"
import {
  Mail,
  Phone,
  ShieldCheck,
  MapPin,
  Hash,
  GraduationCap,
} from "lucide-react"
import { ease } from "@/lib/animations"

import type { StudentProfile, ProfileUser } from "../types"
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
  const wilayaName = profile?.wilayaCode ? getWilayaName(profile.wilayaCode) : null

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
    { key: "studentNumber", icon: Hash, label: labels.studentNumber, value: profile?.studentNumber },
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
      className="space-y-0"
    >
      {/* Section header */}
      <div className="flex items-center gap-2 mb-5">
        <div className="h-px flex-1 bg-border/30" />
        <h2 className="text-[9px] font-bold uppercase tracking-[0.3em] text-muted-foreground/50 shrink-0 [[dir=rtl]_&]:tracking-normal">
          {labels.personalInfo}
        </h2>
        <div className="h-px flex-1 bg-border/30" />
      </div>

      {/* Contact rows */}
      <div className="border border-border/40 divide-y divide-border/20">
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
              <div className="p-1.5 rounded-md bg-primary/5 text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-200">
                <Icon className="h-3.5 w-3.5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground/40 font-bold mb-0.5 [[dir=rtl]_&]:tracking-normal">
                  {row.label}
                </p>
                <p
                  className={
                    hasValue
                      ? "text-sm font-bold text-heading truncate"
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
