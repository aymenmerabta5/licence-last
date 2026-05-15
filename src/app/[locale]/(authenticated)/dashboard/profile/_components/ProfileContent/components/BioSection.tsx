"use client"

import { Edit3, Quote, Sparkles } from "lucide-react"
import * as motion from "motion/react-client"
import type { StudentProfile } from "@/app/[locale]/(authenticated)/dashboard/profile/_components/ProfileContent/types"
import { Button } from "@/components/ui/button"
import { Link } from "@/i18n/routing"
import { ease, fadeIn, reveal } from "@/lib/animations"

interface BioSectionProps {
  profile?: StudentProfile | null
  canEdit: boolean
  labels: {
    bio: string
    emptyMessage: string
    writeBio: string
  }
}

export function BioSection({ profile, canEdit, labels }: BioSectionProps) {
  const hasBio = !!profile?.bio

  return (
    <motion.section
      {...reveal}
      transition={{ delay: 0.3, duration: 0.8, ease }}
      className="relative"
    >
      {/* Section header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-5">
          <span className="text-[10px] font-black text-primary/40 uppercase tracking-[0.3em] hidden sm:block">
            01
          </span>
          <div className="h-12 w-2 rounded-full bg-primary" />
          <h2 className="font-serif text-3xl sm:text-4xl 2xl:text-5xl font-bold text-slate-900 tracking-tight">
            {labels.bio}
          </h2>
        </div>
        {hasBio && (
          <Sparkles className="h-6 w-6 text-primary/30 animate-pulse" />
        )}
      </div>

      {hasBio ? (
        <div className="relative group">
          <div className="relative rounded-[2.5rem] border border-slate-100 bg-white p-10 sm:p-16 2xl:p-20 overflow-hidden shadow-[0_30px_80px_rgba(0,0,0,0.04)]">
            {/* Soft Background Accent */}
            <div className="absolute top-0 end-0 w-96 h-96 bg-primary/[0.02] blur-[120px] rounded-full -translate-y-1/2 translate-x-1/3" />

            {/* Editorial Side Accent */}
            <div className="absolute top-16 start-0 w-1 h-32 bg-gradient-to-b from-primary/20 to-transparent rounded-full hidden sm:block" />

            <div className="relative sm:ps-8">
              {/* Large styled quote */}
              <Quote className="h-16 w-16 2xl:h-20 2xl:w-20 text-primary/5 mb-8 -ms-2" />

              <motion.p
                {...fadeIn}
                transition={{ duration: 1 }}
                className="text-xl sm:text-2xl 2xl:text-3xl text-slate-700 leading-[1.8] font-light whitespace-pre-line first-letter:float-start first-letter:font-serif first-letter:text-[3rem] sm:first-letter:text-[4.5rem] 2xl:first-letter:text-[6rem] first-letter:font-bold first-letter:text-primary first-letter:leading-[0.8] first-letter:me-6 first-letter:mt-4 first-letter:drop-shadow-lg"
              >
                {profile.bio}
              </motion.p>

              {/* Decorative line */}
              <div className="mt-12 h-1.5 w-24 bg-primary/10 rounded-full" />
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-[2.5rem] border-2 border-dashed border-slate-100 bg-white p-16 sm:p-24 2xl:p-32 relative overflow-hidden group shadow-sm">
          <div className="relative text-center space-y-10 max-w-sm mx-auto">
            <motion.div
              animate={{ y: [0, -15, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="flex h-24 w-24 2xl:h-28 2xl:w-28 mx-auto items-center justify-center rounded-[2.5rem] bg-slate-50 border border-slate-100 shadow-inner"
            >
              <Edit3 className="h-10 w-10 2xl:h-12 2xl:w-12 text-slate-300" />
            </motion.div>
            <div className="space-y-4">
              <p className="text-xl text-slate-400 font-medium tracking-wide leading-relaxed">
                {labels.emptyMessage}
              </p>
            </div>
            {canEdit && (
              <Link href="/dashboard/settings" className="inline-block pt-6">
                <Button className="rounded-full h-14 px-12 text-xs font-black uppercase tracking-[0.25em] bg-primary shadow-[0_20px_50px_rgba(var(--primary-rgb),0.3)] transition-all hover:scale-105 active:scale-95">
                  <Edit3 className="h-4 w-4 me-3" /> {labels.writeBio}
                </Button>
              </Link>
            )}
          </div>
        </div>
      )}
    </motion.section>
  )
}
