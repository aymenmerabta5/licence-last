"use client"

import { ArrowRight } from "lucide-react"
import * as motion from "motion/react-client"
import type { ReactNode } from "react"

import { DotSeparator } from "@/components/error/DotSeparator"
import { Navbar } from "@/components/Navbar"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Link } from "@/i18n/routing"
import { ease, reveal } from "@/lib/animations"

interface ErrorAction {
  label: string
  icon?: ReactNode
  onClick?: () => void
  href?: string
}

interface ErrorShellProps {
  variant?: "full-page" | "segment"
  statusCode?: string
  icon?: ReactNode
  edition?: string
  headline: string
  description: string
  primaryAction: ErrorAction
  secondaryAction?: ErrorAction
  suggestion?: string
  errorDigest?: string
  showNavbar?: boolean
}

export function ErrorShell({
  variant = "full-page",
  statusCode,
  icon,
  edition,
  headline,
  description,
  primaryAction,
  secondaryAction,
  suggestion,
  errorDigest,
  showNavbar = true,
}: ErrorShellProps) {
  const isFullPage = variant === "full-page"

  const shellClass = isFullPage
    ? "min-h-screen flex flex-col bg-background text-foreground transition-colors duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]"
    : "flex min-h-[50vh] flex-col items-center justify-center"

  const contentWrapperClass = isFullPage
    ? "flex-1 relative flex items-center justify-center overflow-x-clip px-6 py-16 lg:py-24"
    : "relative flex flex-col items-center text-center w-full"

  const innerClass = isFullPage
    ? "relative z-10 flex flex-col items-center text-center max-w-xl"
    : "relative z-10 flex flex-col items-center text-center max-w-xl"

  function renderAction(
    action: ErrorAction,
    variantName: "editorial" | "editorial-outline",
  ) {
    const iconNode =
      action.icon ??
      (action.href ? (
        <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-2 [[dir=rtl]_&]:group-hover:-translate-x-2" />
      ) : null)

    if (action.href) {
      return (
        <Button
          variant={variantName}
          size="editorial"
          render={<Link href={action.href} />}
          nativeButton={false}
          className="group"
        >
          {action.label}
          {iconNode}
        </Button>
      )
    }

    return (
      <Button
        variant={variantName}
        size="editorial"
        onClick={action.onClick}
        className="group"
      >
        {action.label}
        {iconNode}
      </Button>
    )
  }

  return (
    <main className={shellClass}>
      {isFullPage && showNavbar && <Navbar />}

      <div className={contentWrapperClass}>
        {/* Ambient glow — dark mode only */}
        {isFullPage && (
          <div
            className="pointer-events-none absolute inset-0 opacity-0 dark:opacity-100"
            aria-hidden="true"
          >
            <div className="absolute -top-20 -start-20 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
            <div className="absolute -bottom-28 start-1/2 h-[26rem] w-[26rem] -translate-x-1/2 rounded-full bg-primary/5 blur-3xl" />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/15" />
          </div>
        )}

        <div className={innerClass}>
          {/* Edition marker */}
          {edition && (
            <motion.span
              {...reveal}
              transition={{ duration: 0.7, ease, delay: 0.1 }}
              className="text-[10px] font-medium tracking-[0.35em] uppercase text-primary mb-10 [[dir=rtl]_&]:tracking-normal"
            >
              {edition}
            </motion.span>
          )}

          {/* Top separator */}
          <DotSeparator lineWidth={isFullPage ? 56 : 40} delay={0.2} />

          {/* Giant status code or icon */}
          {statusCode ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.9, ease, delay: 0.3 }}
              className="mt-10 mb-6"
            >
              <span
                className="font-serif text-heading transition-colors duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] dark:drop-shadow-[0_0_24px_var(--color-primary)] block"
                style={{
                  fontSize: "clamp(7rem, 18vw, 14rem)",
                  lineHeight: 0.85,
                  letterSpacing: "-0.04em",
                }}
              >
                {statusCode.split("").map((char, i) => {
                  if (char === "0") {
                    return (
                      <span key={i} className="relative inline-block">
                        <span className="text-primary">0</span>
                        <motion.span
                          initial={{ scaleX: 0 }}
                          animate={{ scaleX: 1 }}
                          transition={{ duration: 0.6, ease, delay: 0.8 }}
                          className="absolute -bottom-1 start-0 end-0 h-[3px] bg-primary origin-left [[dir=rtl]_&]:origin-right"
                          aria-hidden="true"
                        />
                      </span>
                    )
                  }
                  return <span key={i}>{char}</span>
                })}
              </span>
            </motion.div>
          ) : icon ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.9, ease, delay: 0.3 }}
              className="mt-10 mb-6"
            >
              <div className="flex items-center justify-center">
                <div className="flex size-24 items-center justify-center rounded-full bg-primary/10">
                  {icon}
                </div>
              </div>
            </motion.div>
          ) : null}

          {/* Middle separator */}
          <DotSeparator lineWidth={40} delay={0.45} />

          {/* Headline */}
          <motion.h1
            {...reveal}
            transition={{ duration: 0.7, ease, delay: 0.5 }}
            className="font-serif text-2xl md:text-3xl text-heading tracking-tight mt-8 mb-4 transition-colors duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]"
          >
            {headline}
          </motion.h1>

          {/* Divider line */}
          <motion.div
            {...reveal}
            transition={{ duration: 0.6, ease, delay: 0.55 }}
            className="w-full max-w-xs mb-6"
          >
            <Separator className="bg-border/50 transition-colors duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]" />
          </motion.div>

          {/* Description */}
          <motion.p
            {...reveal}
            transition={{ duration: 0.7, ease, delay: 0.6 }}
            className="text-sm leading-relaxed font-light text-muted-foreground max-w-sm mb-10 transition-colors duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]"
          >
            {description}
          </motion.p>

          {/* Error digest */}
          {errorDigest && (
            <motion.p
              {...reveal}
              transition={{ duration: 0.6, ease, delay: 0.65 }}
              className="font-mono text-xs text-muted-foreground/70 mb-6"
            >
              {errorDigest}
            </motion.p>
          )}

          {/* Actions */}
          <motion.div
            {...reveal}
            transition={{ duration: 0.7, ease, delay: 0.7 }}
            className="flex flex-wrap items-center justify-center gap-4"
          >
            {renderAction(primaryAction, "editorial")}
            {secondaryAction &&
              renderAction(secondaryAction, "editorial-outline")}
          </motion.div>

          {/* Bottom separator */}
          <motion.div
            {...reveal}
            transition={{ duration: 0.6, ease, delay: 0.8 }}
            className="mt-14"
          >
            <DotSeparator lineWidth={20} delay={0.85} />
          </motion.div>

          {/* Suggestion text */}
          {suggestion && (
            <motion.p
              {...reveal}
              transition={{ duration: 0.7, ease, delay: 0.9 }}
              className="text-[11px] tracking-[0.15em] uppercase text-muted-foreground/50 mt-8 transition-colors duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] [[dir=rtl]_&]:tracking-normal"
            >
              {suggestion}
            </motion.p>
          )}
        </div>
      </div>
    </main>
  )
}
