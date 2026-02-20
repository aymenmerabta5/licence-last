"use client"

import { ArrowLeft } from "lucide-react"
import * as motion from "motion/react-client"

import { ease, reveal } from "@/lib/animations"

interface FormHeaderProps {
  title: string
  subtitle?: string
  onBack?: () => void
  backLabel?: string
}

export function FormHeader({
  title,
  subtitle,
  onBack,
  backLabel,
}: FormHeaderProps) {
  return (
    <motion.div
      {...reveal}
      transition={{ duration: 0.6, ease }}
      className="mb-10 lg:mb-14"
    >
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 text-[11px] font-semibold text-muted-foreground hover:text-heading transition-colors duration-300 uppercase tracking-[0.15em] mb-6 [[dir=rtl]_&]:tracking-normal"
        >
          <ArrowLeft className="h-3.5 w-3.5 [[dir=rtl]_&]:rotate-180" />
          {backLabel || "Back"}
        </button>
      )}
      <h1 className="font-serif text-4xl md:text-5xl lg:text-[56px] leading-[1.1] text-heading tracking-tight mb-4 transition-colors duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]">
        {title}
      </h1>
      {subtitle && (
        <p className="text-base md:text-lg text-muted-foreground font-light leading-relaxed max-w-xl transition-colors duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]">
          {subtitle}
        </p>
      )}
    </motion.div>
  )
}
