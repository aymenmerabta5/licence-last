"use client"

import { CheckCircle2 } from "lucide-react"
import * as motion from "motion/react-client"

interface SuccessMessageProps {
  message: string
  className?: string
}

export function SuccessMessage({ message, className }: SuccessMessageProps) {
  if (!message) return null

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      className={`flex items-start gap-2.5 p-3.5 text-sm text-primary bg-primary/5 border border-primary/20 dark:bg-primary/10 dark:border-primary/20 ${className ?? ""}`}
    >
      <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
      <span>{message}</span>
    </motion.div>
  )
}
