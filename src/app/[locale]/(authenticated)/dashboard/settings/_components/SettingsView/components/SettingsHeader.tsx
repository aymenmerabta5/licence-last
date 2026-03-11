"use client"

import * as motion from "motion/react-client"
import { Settings } from "lucide-react"

import { ease } from "@/lib/animations"

export function SettingsHeader() {
  return (
    <motion.header
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8, ease }}
      className="relative overflow-hidden rounded-[2.5rem] border border-border/30 bg-card px-8 py-10 sm:px-12 sm:py-14"
    >
      {/* Decorative background elements */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute -top-24 -end-24 h-64 w-64 rounded-full bg-primary/[0.04] blur-3xl hidden dark:block" />
        <div className="absolute bottom-0 start-0 h-40 w-40 rounded-full bg-primary/[0.03] blur-2xl hidden dark:block" />
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.015)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)]" />
      </div>

      <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease, delay: 0.15 }}
          className="space-y-4"
        >
          <div className="flex items-center gap-3">
            <div className="h-px w-8 bg-primary/40" />
            <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-primary/70">
              Account Directory
            </p>
          </div>
          <h1 className="font-serif text-[clamp(2.5rem,5vw,3.75rem)] leading-[0.95] tracking-tight text-heading">
            Settings
          </h1>
          <p className="text-muted-foreground text-sm font-light tracking-wide max-w-lg leading-relaxed">
            Curate your digital profile, configure security measures, and
            calibrate your ecosystem preferences.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease, delay: 0.3 }}
          className="hidden lg:flex flex-col items-end gap-4 pb-1 shrink-0"
        >
          <div className="relative group">
            <div className="absolute -inset-3 rounded-3xl bg-primary/[0.06] blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 hidden dark:block" />
            <div className="relative h-14 w-14 flex items-center justify-center rounded-2xl bg-primary/10 border border-primary/20 text-primary shadow-inner">
              <Settings className="h-6 w-6 stroke-[1.5] animate-[spin_12s_linear_infinite]" />
            </div>
          </div>
          <div className="text-end font-mono text-[9px] uppercase tracking-widest text-muted-foreground/40">
            <p>Workspace Active</p>
          </div>
        </motion.div>
      </div>

      {/* Bottom decorative line */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 1, ease, delay: 0.4 }}
        className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent origin-center"
      />
    </motion.header>
  )
}
