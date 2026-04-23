"use client"

import { Mail, MapPin, Phone, User, Hash, GraduationCap, Info } from "lucide-react"
import * as motion from "motion/react-client"
import type { ProfileContentProps } from "@/app/[locale]/(authenticated)/dashboard/profile/_components/ProfileContent/types"
import { ease } from "@/lib/animations"

interface ContactInfoCardProps {
  user: ProfileContentProps["user"]
  profile: any
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
      value: profile?.location || labels.notSetYet,
      icon: MapPin,
    },
    {
      label: labels.phone,
      value: profile?.phone || labels.notSetYet,
      icon: Phone,
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
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.3, duration: 0.8, ease }}
      className="relative group"
    >
      <div className="relative overflow-hidden rounded-[2.5rem] border border-slate-100 bg-white shadow-[0_20px_50px_rgba(0,0,0,0.03)] transition-all duration-500 hover:shadow-[0_30px_70px_rgba(0,0,0,0.06)]">
        <div className="px-8 py-7 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
          <div className="flex items-center gap-4">
             <div className="h-6 w-1.5 rounded-full bg-primary" />
             <h2 className="text-[11px] font-black uppercase tracking-[0.25em] text-slate-800">
               {labels.personalInfo}
             </h2>
          </div>
          <Info className="h-4 w-4 text-slate-300" />
        </div>

        <div className="p-8 space-y-3">
          {infoItems.map((item, i) => (
            <motion.div
              key={i}
              whileHover={{ x: 5 }}
              className="flex items-center gap-6 p-4 rounded-3xl hover:bg-slate-50 transition-all group/item"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-100 border border-slate-200 group-hover/item:border-primary/20 group-hover/item:bg-white transition-all duration-300">
                <item.icon className="h-5 w-5 text-primary group-hover/item:scale-110 transition-transform" />
              </div>
              <div className="space-y-1.5 overflow-hidden">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em]">
                  {item.label}
                </p>
                <p className="text-[15px] font-bold text-slate-700 truncate group-hover/item:text-primary transition-colors">
                  {item.value}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  )
}
