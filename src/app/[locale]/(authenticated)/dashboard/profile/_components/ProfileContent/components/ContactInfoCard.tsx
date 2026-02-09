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

import { Card } from "@/components/ui/card"

import type { StudentProfile, ProfileUser } from "../types"
import { ROLE_LABELS } from "../utils"
import { getWilayaName } from "@/lib/wilayas"

interface ContactInfoCardProps {
  user: ProfileUser
  profile?: StudentProfile | null
  isStudent: boolean
  labels: {
    personalInfo: string
    email: string
    phone: string
    location: string
    studentNumber: string
    department: string
  }
}

export function ContactInfoCard({ user, profile, isStudent, labels }: ContactInfoCardProps) {
  const wilayaName = profile?.wilayaCode ? getWilayaName(profile.wilayaCode) : null

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="space-y-3"
    >
      <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground/50">
        {labels.personalInfo}
      </h2>
      <Card className="bg-background border-border/40 rounded-2xl p-6 shadow-sm">
        <div className="space-y-5">
          <ContactField
            icon={Mail}
            label={labels.email}
            value={user.email}
            hasValue
          />

          {isStudent && (
            <>
              <Divider />
              <ContactField
                icon={Phone}
                label={labels.phone}
                value={profile?.phone}
                placeholder="Not set yet"
              />
            </>
          )}

          <Divider />

          <ContactField
            icon={ShieldCheck}
            label="Role"
            value={ROLE_LABELS[user.role || "student"] || user.role}
            hasValue
          />

          <Divider />

          <ContactField
            icon={MapPin}
            label={labels.location}
            value={wilayaName}
            placeholder="Not set yet"
          />

          {isStudent && profile?.studentNumber && (
            <>
              <Divider />
              <ContactField
                icon={Hash}
                label={labels.studentNumber}
                value={profile.studentNumber}
                hasValue
              />
            </>
          )}

          {isStudent && profile?.department && (
            <>
              <Divider />
              <ContactField
                icon={GraduationCap}
                label={labels.department}
                value={profile.level ? `${profile.department} — ${profile.level}` : profile.department}
                hasValue
              />
            </>
          )}
        </div>
      </Card>
    </motion.section>
  )
}

function ContactField({
  icon: Icon,
  label,
  value,
  placeholder,
  hasValue = false,
}: {
  icon: typeof Mail
  label: string
  value?: string | null
  placeholder?: string
  hasValue?: boolean
}) {
  const displayValue = hasValue || value ? value : placeholder
  const textClass = hasValue || value
    ? "text-sm font-bold text-heading"
    : "text-sm text-muted-foreground font-medium italic"

  return (
    <div className="flex items-center gap-3.5">
      <div className="p-2 rounded-lg bg-primary/5 text-primary">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <p className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground/50 font-bold mb-0.5">
          {label}
        </p>
        <p className={`${textClass} truncate`}>{displayValue}</p>
      </div>
    </div>
  )
}

function Divider() {
  return <div className="h-px bg-border/20" />
}
