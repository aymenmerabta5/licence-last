"use client"

import * as motion from "motion/react-client"
import { useTranslations } from "next-intl"
import { ArrowRight, Loader2 } from "lucide-react"
import { Link } from "@/i18n/routing"
import { reveal, ease } from "@/lib/animations"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import type { LoginFormApi } from "../hooks/useLoginForm"

interface FormFooterProps {
  form: LoginFormApi
  rememberMe: boolean
  onRememberChange: (checked: boolean) => void
}

export function FormFooter({ form, rememberMe, onRememberChange }: FormFooterProps) {
  const t = useTranslations("auth.login")

  return (
    <>
      {/* Remember Me + Forgot Password */}
      <motion.div
        {...reveal}
        transition={{ duration: 0.6, ease, delay: 0.15 }}
        className="flex items-center justify-between"
      >
        <label className="flex items-center gap-2.5 cursor-pointer select-none">
          <div className="relative flex items-center justify-center">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => onRememberChange(e.target.checked)}
              className="peer h-4 w-4 appearance-none border border-border bg-transparent checked:bg-primary checked:border-primary focus-visible:ring-2 focus-visible:ring-ring/50 transition-colors cursor-pointer"
            />
            <svg
              className="absolute h-3 w-3 text-primary-foreground pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={3}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <span className="text-sm text-muted-foreground">
            {t("rememberMe")}
          </span>
        </label>

        <Link
          href="/reset-password"
          className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
        >
          {t("forgotPassword")}
        </Link>
      </motion.div>

      {/* Submit Button */}
      <motion.div
        {...reveal}
        transition={{ duration: 0.6, ease, delay: 0.2 }}
      >
        <form.Subscribe
          selector={(state) => [state.isSubmitting] as const}
        >
          {([isSubmitting]) => (
            <Button
              type="submit"
              variant="editorial"
              size="editorial"
              className="w-full h-12"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  {t("submit")}
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          )}
        </form.Subscribe>
      </motion.div>

      {/* OR Divider */}
      <motion.div
        {...reveal}
        transition={{ duration: 0.6, ease, delay: 0.25 }}
        className="relative"
      >
        <Separator />
        <span className="absolute top-1/2 start-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-4 text-[10px] text-muted-foreground/50 uppercase tracking-[0.2em]">
          {t("or")}
        </span>
      </motion.div>

      {/* Sign Up Prompt */}
      <motion.p
        {...reveal}
        transition={{ duration: 0.6, ease, delay: 0.3 }}
        className="text-center text-sm text-muted-foreground"
      >
        {t("noAccount")}{" "}
        <Link
          href="/signup"
          className="font-bold text-heading hover:text-primary transition-colors duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] uppercase tracking-wide text-xs [[dir=rtl]_&]:tracking-normal"
        >
          {t("createOne")}
        </Link>
      </motion.p>
    </>
  )
}
