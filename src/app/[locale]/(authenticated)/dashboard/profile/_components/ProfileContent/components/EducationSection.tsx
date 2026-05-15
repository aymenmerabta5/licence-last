"use client"

import { GraduationCap, MapPin } from "lucide-react"
import * as motion from "motion/react-client"
import type { StudentProfile } from "@/app/[locale]/(authenticated)/dashboard/profile/_components/ProfileContent/types"
import { Button } from "@/components/ui/button"
import { Link } from "@/i18n/routing"
import { ease, reveal } from "@/lib/animations"

interface EducationSectionProps {
  profile?: StudentProfile | null
  university?: { name: string; city: string | null } | null
  canEdit: boolean
  labels: {
    education: string
    emptyMessage: string
    addEducation: string
    university: string
  }
}

export function EducationSection({
  profile,
  university,
  canEdit,
  labels,
}: EducationSectionProps) {
  const hasEducation = !!university

  return (
    <motion.section
      {...reveal}
      transition={{ delay: 0.4, duration: 0.8, ease }}
      className="space-y-8"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-5">
          <span className="text-[10px] font-black text-primary/40 uppercase tracking-[0.3em] hidden sm:block">
            02
          </span>
          <div className="h-12 w-2 rounded-full bg-primary/40" />
          <h2 className="font-serif text-3xl sm:text-4xl 2xl:text-5xl font-bold text-slate-900 tracking-tight">
            {labels.education}
          </h2>
        </div>
      </div>

      {hasEducation ? (
        <div className="relative">
          {/* Timeline Line */}
          <div className="absolute top-0 bottom-0 start-[27px] sm:start-[35px] md:start-[43px] w-1 bg-gradient-to-b from-primary/30 via-primary/10 to-transparent rounded-full" />

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="relative ps-2 sm:ps-4 md:ps-6 group"
          >
            {/* Timeline Marker */}
            <div className="absolute start-[18px] sm:start-[26px] md:start-[34px] top-5 h-6 w-6 rounded-full border-4 border-white bg-primary shadow-lg shadow-primary/20 group-hover:scale-125 transition-transform" />

            <div className="rounded-[2.5rem] border border-slate-100 bg-white p-8 sm:p-12 2xl:p-14 shadow-[0_20px_50px_rgba(0,0,0,0.03)] hover:shadow-[0_30px_70px_rgba(0,0,0,0.06)] transition-all duration-500">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-8">
                <div className="space-y-6">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-primary text-[10px] font-black uppercase tracking-[0.2em]">
                      <GraduationCap className="h-4 w-4" />
                      {labels.university}
                    </div>
                    <h3 className="text-2xl sm:text-3xl 2xl:text-4xl font-bold text-slate-800 leading-tight font-serif">
                      {university.name}
                    </h3>
                  </div>

                  {university.city && (
                    <div className="flex flex-wrap gap-6">
                      <div className="flex items-center gap-2.5 text-slate-400 font-medium">
                        <MapPin className="h-5 w-5 text-slate-300" />
                        <span className="text-sm">{university.city}</span>
                      </div>
                    </div>
                  )}

                  {profile?.department && (
                    <div className="pt-5 border-t border-slate-50">
                      <div className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mb-1.5">
                        Department
                      </div>
                      <p className="text-lg font-bold text-slate-600">
                        {profile.department}{" "}
                        {profile.level && `— ${profile.level}`}
                      </p>
                    </div>
                  )}
                </div>

                {canEdit && (
                  <Link href="/dashboard/settings">
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-full border-slate-200 text-slate-400 hover:text-primary transition-colors"
                    >
                      Edit
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      ) : (
        <div className="rounded-[2.5rem] border-2 border-dashed border-slate-100 bg-white/50 p-16 text-center space-y-8">
          <GraduationCap className="h-16 w-16 mx-auto text-slate-100" />
          <p className="text-lg text-slate-300 font-medium max-w-xs mx-auto">
            {labels.emptyMessage}
          </p>
          {canEdit && (
            <Link href="/dashboard/settings">
              <Button className="rounded-full h-14 px-10 bg-primary text-xs font-black uppercase tracking-widest">
                {labels.addEducation}
              </Button>
            </Link>
          )}
        </div>
      )}
    </motion.section>
  )
}
