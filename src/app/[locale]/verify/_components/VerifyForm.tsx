"use client"

import { motion } from "motion/react"
import { ShieldCheck } from "lucide-react"
import { useTranslations } from "next-intl"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useRouter } from "@/i18n/routing"
import { ease, reveal, revealWithDelay } from "@/lib/animations"

export function VerifyForm() {
  const t = useTranslations("verify")
  const router = useRouter()
  const [code, setCode] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = code.trim().toUpperCase()
    if (!trimmed) return

    setIsSubmitting(true)
    router.push(`/verify/${encodeURIComponent(trimmed)}` as never)
  }

  return (
    <motion.div
      variants={reveal}
      initial="initial"
      animate="animate"
      transition={revealWithDelay(0.15)}
      className="relative"
    >
      {/* Seal visual */}
      <motion.div
        className="flex justify-center mb-8"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.1 }}
      >
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-primary/10 blur-2xl scale-150" />
          <div className="relative flex items-center justify-center size-20 rounded-full border-2 border-primary/15 bg-card shadow-sm">
            <ShieldCheck className="size-9 text-primary" strokeWidth={1.5} />
          </div>
          {/* Orbiting dots for official feel */}
          <div className="absolute inset-0 rounded-full border border-dashed border-primary/10 animate-[spin_12s_linear_infinite]" />
        </div>
      </motion.div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <motion.div
          className="space-y-2"
          {...reveal}
          transition={{ duration: 0.5, ease, delay: 0.25 }}
        >
          <Input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder={t("placeholder")}
            className="font-mono text-xl tracking-[0.15em] text-center uppercase h-14 border-2 border-border bg-card shadow-sm transition-all duration-300 focus:border-primary/40 focus:ring-2 focus:ring-primary/10"
            maxLength={20}
            autoFocus
          />
        </motion.div>

        <motion.div
          {...reveal}
          transition={{ duration: 0.5, ease, delay: 0.35 }}
        >
          <Button
            type="submit"
            disabled={!code.trim() || isSubmitting}
            className="w-full h-12 text-base font-semibold shadow-sm rounded-none"
            size="lg"
          >
            <ShieldCheck className="size-4 me-2" />
            {isSubmitting ? t("checking") : t("submit")}
          </Button>
        </motion.div>
      </form>
    </motion.div>
  )
}
