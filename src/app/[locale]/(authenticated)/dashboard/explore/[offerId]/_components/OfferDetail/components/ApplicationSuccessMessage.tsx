"use client"

import * as motion from "motion/react-client"
import { CheckCircle2 } from "lucide-react"

interface ApplicationSuccessMessageProps {
  successMsg: string
}

export function ApplicationSuccessMessage({
  successMsg,
}: ApplicationSuccessMessageProps) {
  if (!successMsg) return null

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="border border-green-500/30 bg-green-500/5 p-4 flex items-center gap-3"
    >
      <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 shrink-0" />
      <p className="text-sm text-green-700 dark:text-green-300 font-medium">
        {successMsg}
      </p>
    </motion.div>
  )
}
