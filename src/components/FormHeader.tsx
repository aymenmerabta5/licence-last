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
    <motion.div {...reveal} transition={{ duration: 0.6, ease }}>
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-heading transition-colors duration-300 uppercase tracking-wide mb-4 [[dir=rtl]_&]:tracking-normal"
        >
          <ArrowLeft className="h-3.5 w-3.5 [[dir=rtl]_&]:rotate-180" />
          {backLabel || "Back"}
        </button>
      )}
      <h1 className="font-serif text-3xl text-heading tracking-tight mb-2 transition-colors duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]">
        {title}
      </h1>
      {subtitle && (
        <p className="text-sm text-muted-foreground font-light transition-colors duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]">
          {subtitle}
        </p>
      )}
    </motion.div>
  )
}
