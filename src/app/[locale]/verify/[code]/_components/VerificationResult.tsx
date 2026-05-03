"use client"

import {
  Building2,
  Calendar,
  FileText,
  GraduationCap,
  ShieldCheck,
  ShieldX,
  User,
} from "lucide-react"
import { motion } from "motion/react"
import type { InferRouterOutputs } from "@orpc/server"
import { useLocale, useTranslations } from "next-intl"

import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { Link } from "@/i18n/routing"
import { ease, reveal, revealWithDelay } from "@/lib/animations"
import { cn } from "@/lib/utils"
import type { AppRouter } from "@/server/orpc/router"

type VerifyDocumentResult = InferRouterOutputs<AppRouter>["documents"]["verify"]

interface VerificationResultProps {
  result: VerifyDocumentResult
  code: string
}

export function VerificationResult({ result, code }: VerificationResultProps) {
  const t = useTranslations("verify")
  const locale = useLocale()

  const formatDate = (date: Date) =>
    new Date(date).toLocaleDateString(
      locale === "fr" ? "fr-FR" : locale === "ar" ? "ar-SA" : "en-US",
      { year: "numeric", month: "long", day: "numeric" },
    )

  if (!result.valid) {
    return (
      <motion.div
        variants={reveal}
        initial="initial"
        animate="animate"
        transition={revealWithDelay(0.1)}
      >
        <div className="relative overflow-hidden rounded-2xl border border-destructive/20 bg-card shadow-sm">
          <div className="pointer-events-none absolute -top-24 -end-24 size-64 rounded-full bg-destructive/5 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-16 -start-16 size-48 rounded-full bg-destructive/5 blur-3xl" />

          <div className="relative p-6 sm:p-10">
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0.5, opacity: 0, rotate: -15 }}
                animate={{ scale: 1, opacity: 1, rotate: 0 }}
                transition={{
                  type: "spring",
                  stiffness: 200,
                  damping: 15,
                  delay: 0.2,
                }}
                className="inline-flex items-center justify-center size-24 rounded-full border-4 border-destructive/10 bg-destructive/5 mb-6"
              >
                <ShieldX
                  className="size-11 text-destructive"
                  strokeWidth={1.5}
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease, delay: 0.3 }}
              >
                <Badge
                  variant="editorial"
                  className="mb-4 border-destructive/20 text-destructive bg-destructive/5"
                >
                  {t("stampInvalid")}
                </Badge>
                <h1 className="font-serif text-2xl sm:text-3xl font-bold mb-2">
                  {t("invalid.title")}
                </h1>
                <p className="text-muted-foreground max-w-sm mx-auto leading-relaxed">
                  {t("invalid.subtitle")}
                </p>
                <p className="font-mono text-sm text-muted-foreground mt-4 inline-block px-4 py-1.5 bg-muted rounded-md tracking-wider border border-border/50">
                  {code}
                </p>
              </motion.div>
            </div>

            <div className="mt-8 pt-6 border-t border-border text-center">
              <Link
                href="/verify"
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "rounded-none",
                )}
              >
                {t("invalid.tryAgain")}
              </Link>
            </div>
          </div>
        </div>
      </motion.div>
    )
  }

  const typeLabel =
    result.documentType === "agreement"
      ? t("valid.typeAgreement")
      : t("valid.typeCertificate")

  const statusLabel =
    result.documentStatus === "generated"
      ? t("valid.statusGenerated")
      : result.documentStatus === "signed"
        ? t("valid.statusSigned")
        : t("valid.statusPending")

  const statusColor =
    result.documentStatus === "signed"
      ? "bg-green-500/10 text-green-700 dark:text-green-300 border-green-500/20"
      : result.documentStatus === "generated"
        ? "bg-primary/10 text-primary border-primary/20"
        : "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20"

  return (
    <motion.div
      variants={reveal}
      initial="initial"
      animate="animate"
      transition={revealWithDelay(0.1)}
    >
      <div className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div className="pointer-events-none absolute -top-24 -end-24 size-64 rounded-full bg-primary/5 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 -start-16 size-48 rounded-full bg-primary/5 blur-3xl" />

        <div className="relative p-6 sm:p-10">
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0.5, opacity: 0, rotate: -180 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              transition={{
                type: "spring",
                stiffness: 180,
                damping: 14,
                delay: 0.2,
              }}
              className="inline-flex items-center justify-center size-24 rounded-full border-4 border-green-500/15 bg-green-500/5 mb-6"
            >
              <ShieldCheck
                className="size-11 text-green-600 dark:text-green-400"
                strokeWidth={1.5}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease, delay: 0.3 }}
            >
              <Badge
                variant="editorial"
                className="mb-4 bg-green-500/10 text-green-700 dark:text-green-300 border-green-500/20"
              >
                {t("stampVerified")}
              </Badge>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold mb-2">
                {t("valid.title")}
              </h1>
              <p className="text-muted-foreground max-w-sm mx-auto leading-relaxed">
                {t("valid.subtitle")}
              </p>
              <p className="font-mono text-sm text-muted-foreground mt-4 inline-block px-4 py-1.5 bg-muted rounded-md tracking-wider border border-border/50">
                {code}
              </p>
            </motion.div>
          </div>

          <div className="border-t border-border pt-6 space-y-1">
            <InfoRow
              icon={<FileText className="size-4" strokeWidth={1.5} />}
              label={t("valid.type")}
              value={typeLabel}
            />
            <InfoRow
              icon={<User className="size-4" strokeWidth={1.5} />}
              label={t("valid.student")}
              value={result.studentName}
            />
            <InfoRow
              icon={<Building2 className="size-4" strokeWidth={1.5} />}
              label={t("valid.company")}
              value={result.companyName}
            />
            {result.universityName && (
              <InfoRow
                icon={<GraduationCap className="size-4" strokeWidth={1.5} />}
                label={t("valid.university")}
                value={result.universityName}
              />
            )}
            <InfoRow
              icon={<FileText className="size-4" strokeWidth={1.5} />}
              label={t("valid.offer")}
              value={result.offerTitle}
            />
            <InfoRow
              icon={<Calendar className="size-4" strokeWidth={1.5} />}
              label={t("valid.period")}
              value={`${formatDate(result.startDate)} ${t("valid.periodTo")} ${formatDate(result.endDate)}`}
            />
            <InfoRow
              icon={<FileText className="size-4" strokeWidth={1.5} />}
              label={t("valid.status")}
              value={
                <Badge
                  variant="outline"
                  className={cn("text-xs font-semibold", statusColor)}
                >
                  {statusLabel}
                </Badge>
              }
            />
            {result.generatedAt && (
              <InfoRow
                icon={<Calendar className="size-4" strokeWidth={1.5} />}
                label={t("valid.generatedOn")}
                value={formatDate(new Date(result.generatedAt))}
              />
            )}
          </div>

          <div className="mt-8 pt-6 border-t border-border text-center space-y-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-muted-foreground/60">
              Verified by Stag.io
            </p>
            <Link
              href="/verify"
              className={cn(
                buttonVariants({ variant: "outline" }),
                "rounded-none",
              )}
            >
              {t("invalid.tryAgain")}
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: React.ReactNode
}) {
  return (
    <div className="flex items-start gap-4 py-3.5 border-b border-border/40 last:border-0 transition-colors hover:bg-muted/30 -mx-2 px-2 rounded-md">
      <span className="text-muted-foreground/70 mt-0.5 shrink-0">{icon}</span>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">
          {label}
        </p>
        <div className="font-medium text-sm sm:text-base leading-snug">
          {value}
        </div>
      </div>
    </div>
  )
}
