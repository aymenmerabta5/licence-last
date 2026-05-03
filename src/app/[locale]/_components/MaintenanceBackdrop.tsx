"use client"

import { motion } from "motion/react"
import { ease } from "@/lib/animations"

export function MaintenanceBackdrop() {
  return (
    <>
      {/* Atmospheric texture overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.025] dark:opacity-[0.04]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 35%, var(--color-primary) 0px, transparent 1px), " +
            "radial-gradient(circle at 80% 20%, var(--color-primary) 0px, transparent 1px), " +
            "radial-gradient(circle at 50% 85%, var(--color-primary) 0px, transparent 1px), " +
            "radial-gradient(circle at 65% 60%, var(--color-primary) 0px, transparent 1px), " +
            "radial-gradient(circle at 30% 70%, var(--color-primary) 0px, transparent 1px)",
          backgroundSize: "320px 320px, 440px 440px, 280px 280px, 360px 360px, 400px 400px",
        }}
      />

      {/* Diagonal accent stroke */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ duration: 1.2, ease, delay: 0.3 }}
          className="absolute start-[15%] top-0 h-[1px] w-[70%] origin-start bg-primary/20 dark:bg-primary/25"
          style={{ transform: "rotate(-12deg) translateY(28vh)" }}
        />
        <motion.div
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ duration: 1.2, ease, delay: 0.5 }}
          className="absolute end-[10%] top-0 h-[1px] w-[55%] origin-end bg-primary/10 dark:bg-primary/15"
          style={{ transform: "rotate(8deg) translateY(62vh)" }}
        />
      </div>
    </>
  )
}
