"use client"

import * as motion from "motion/react-client"

import { Separator } from "@/components/ui/separator"
import { Link } from "@/i18n/routing"
import { ease } from "@/lib/animations"

interface SignupFooterProps {
  orLabel: string
  hasAccountLabel: string
  signInLabel: string
}

export function SignupFooter({
  orLabel,
  hasAccountLabel,
  signInLabel,
}: SignupFooterProps) {
  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease, delay: 0.25 }}
        className="relative"
      >
        <Separator />
        <span className="absolute top-1/2 start-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-4 text-[10px] text-muted-foreground/50 uppercase tracking-[0.2em]">
          {orLabel}
        </span>
      </motion.div>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease, delay: 0.3 }}
        className="text-center text-sm text-muted-foreground"
      >
        {hasAccountLabel}{" "}
        <Link
          href="/login"
          className="font-bold text-heading hover:text-primary transition-colors duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] uppercase tracking-wide text-xs [[dir=rtl]_&]:tracking-normal"
        >
          {signInLabel}
        </Link>
      </motion.p>
    </>
  )
}
