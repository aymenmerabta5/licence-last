"use client"

import { Briefcase, Calendar, MapPin, Plus } from "lucide-react"
import * as motion from "motion/react-client"
import { useLocale } from "next-intl"
import type { StudentExperience } from "@/app/[locale]/(authenticated)/dashboard/profile/_components/ProfileContent/types"
import { Button } from "@/components/ui/button"
import { Link } from "@/i18n/routing"
import { ease } from "@/lib/animations"

interface ExperienceSectionProps {
  experiences: StudentExperience[]
  canEdit: boolean
  labels: {
    experience: string
    emptyMessage: string
    addExperience: string
  }
}

export function ExperienceSection({
  experiences,
  canEdit,
  labels,
}: ExperienceSectionProps) {
  const locale = useLocale()
  const hasExperience = experiences.length > 0

  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.8, ease }}
      className="space-y-10"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="h-12 w-2 rounded-full bg-primary/40" />
          <h2 className="font-serif text-5xl font-bold text-slate-900 tracking-tight">
            {labels.experience}
          </h2>
        </div>
      </div>

      {hasExperience ? (
        <div className="relative space-y-10">
          {/* Timeline Line */}
          <div className="absolute top-0 bottom-0 left-[39px] w-0.5 bg-slate-100" />

          {experiences.map((exp, idx) => (
            <motion.div
              key={exp.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 + idx * 0.1 }}
              className="relative pl-24 group"
            >
              {/* Timeline Marker */}
              <div className="absolute left-[30px] top-6 h-5 w-5 rounded-full border-4 border-white bg-primary shadow-lg group-hover:scale-125 transition-transform" />

              <div className="rounded-[2.5rem] border border-slate-100 bg-white p-10 sm:p-14 shadow-[0_20px_50px_rgba(0,0,0,0.03)] hover:shadow-[0_30px_70px_rgba(0,0,0,0.06)] transition-all duration-500">
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-primary text-[10px] font-black uppercase tracking-[0.2em]">
                        <Briefcase className="h-4 w-4" />
                        {exp.organization}
                      </div>
                      <h3 className="text-3xl font-bold text-slate-800 leading-tight">
                        {exp.title}
                      </h3>
                    </div>
                    <div className="flex items-center gap-2.5 px-5 py-2.5 rounded-2xl bg-slate-50 border border-slate-100 text-slate-400 font-bold text-[11px] uppercase tracking-widest whitespace-nowrap">
                       <Calendar className="h-3.5 w-3.5 text-slate-300" />
                       {exp.startDate.getFullYear()} — {exp.endDate ? exp.endDate.getFullYear() : "Present"}
                    </div>
                  </div>

                  {exp.description && (
                    <p className="text-lg text-slate-500 leading-relaxed font-light">
                      {exp.description}
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
          
          {canEdit && (
            <div className="pl-24">
               <Link href="/dashboard/settings">
                 <button className="flex items-center gap-3 text-[11px] font-black uppercase tracking-[0.25em] text-slate-300 hover:text-primary transition-all">
                    <span>+ {labels.addExperience}</span>
                    <motion.span animate={{ x: [0, 5, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}>→</motion.span>
                 </button>
               </Link>
            </div>
          )}
        </div>
      ) : (
        <div className="rounded-[2.5rem] border-2 border-dashed border-slate-100 bg-white/50 p-16 text-center space-y-8">
           <Briefcase className="h-16 w-16 mx-auto text-slate-100" />
           <p className="text-lg text-slate-300 font-medium max-w-xs mx-auto">
             {labels.emptyMessage}
           </p>
           {canEdit && (
              <Link href="/dashboard/settings">
                <Button className="rounded-full h-14 px-10 bg-primary text-xs font-black uppercase tracking-widest">
                   {labels.addExperience}
                </Button>
              </Link>
           )}
        </div>
      )}
    </motion.section>
  )
}
