"use client"

import { motion } from "motion/react"
import { useTranslations } from "next-intl"
import { reveal, ease } from "@/lib/animations"

export function MaintenancePage() {
  const t = useTranslations("maintenance")

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <motion.div
        className="text-center"
        initial="initial"
        animate="animate"
        variants={reveal}
        transition={{ duration: 0.6, ease }}
      >
        <h1 className="font-serif text-4xl font-medium tracking-tight text-heading sm:text-5xl md:text-6xl">
          {t("title")}
        </h1>
        <p className="mx-auto mt-4 max-w-md font-sans text-base leading-relaxed text-muted-foreground sm:text-lg">
          {t("subtitle")}
        </p>
      </motion.div>
    </div>
  )
}
