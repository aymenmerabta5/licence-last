"use client"

import * as motion from "motion/react-client"
import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"

const reveal = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
}
const ease = [0.4, 0, 0.2, 1] as const

interface SubmitButtonProps {
  isSubmitting: boolean
  children: React.ReactNode
  className?: string
  delay?: number
}

export function SubmitButton({
  isSubmitting,
  children,
  className,
  delay = 0,
}: SubmitButtonProps) {
  return (
    <motion.div
      {...reveal}
      transition={{ duration: 0.6, ease, delay }}
    >
      <Button
        type="submit"
        variant="editorial"
        size="editorial"
        className={`w-full h-12 ${className ?? ""}`}
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          children
        )}
      </Button>
    </motion.div>
  )
}
