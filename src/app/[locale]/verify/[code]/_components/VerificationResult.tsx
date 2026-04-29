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
import { Button } from "@/components/ui/button"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Link } from "@/i18n/routing"
import { ease, reveal } from "@/lib/animations"
import type { AppRouter } from "@/server/orpc/router"

type VerifyDocumentResult = InferRouterOutputs<AppRouter>["documents"]["verify"]

interface VerificationResultProps {
  result: VerifyDocumentResult
  code: string
}

export function VerificationResult({ result, code }: VerificationResultProps) {
  const t = useTranslations("verify")
  const locale = useLocale()

  if (!result.valid) {
    return (
      <motion.div
        variants={reveal}
        initial="initial"
        animate="animate"
        transition={{ duration: 0.6, ease }}
      >
        <Card className="border-destructive/30 bg-destructive/5">
          <CardHeader className="text-center pb-4">
            <ShieldX className="size-16 mx-auto text-destructive mb-4" />
            <h1 className="font-serif text-2xl font-bold">
              {t("invalid.title")}
            </h1>
            <p className="text-muted-foreground mt-2">
              {t("invalid.subtitle")}
            </p>
            <p className="font-mono text-sm text-muted-foreground mt-2">
              {code}
            </p>
          </CardHeader>
          <CardContent className="text-center">
            <Button variant="outline" render={<Link href="/verify" />}>
              {t("invalid.tryAgain")}
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  const formatDate = (date: Date) =>
    new Date(date).toLocaleDateString(
      locale === "fr" ? "fr-FR" : locale === "ar" ? "ar-SA" : "en-US",
      { year: "numeric", month: "long", day: "numeric" },
    )

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

  return (
    <motion.div
      variants={reveal}
      initial="initial"
      animate="animate"
      transition={{ duration: 0.6, ease }}
    >
      <Card className="border-green-500/30 bg-green-50/50 dark:bg-green-950/10">
        <CardHeader className="text-center pb-4">
          <ShieldCheck className="size-16 mx-auto text-green-600 dark:text-green-400 mb-4" />
          <h1 className="font-serif text-2xl font-bold">{t("valid.title")}</h1>
          <p className="text-muted-foreground mt-2">{t("valid.subtitle")}</p>
          <p className="font-mono text-sm text-muted-foreground mt-2">{code}</p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <InfoRow
              icon={<FileText className="size-4" />}
              label={t("valid.type")}
              value={typeLabel}
            />
            <InfoRow
              icon={<User className="size-4" />}
              label={t("valid.student")}
              value={result.studentName}
            />
            <InfoRow
              icon={<Building2 className="size-4" />}
              label={t("valid.company")}
              value={result.companyName}
            />
            {result.universityName && (
              <InfoRow
                icon={<GraduationCap className="size-4" />}
                label={t("valid.university")}
                value={result.universityName}
              />
            )}
            <InfoRow
              icon={<FileText className="size-4" />}
              label={t("valid.offer")}
              value={result.offerTitle}
            />
            <InfoRow
              icon={<Calendar className="size-4" />}
              label={t("valid.period")}
              value={`${formatDate(result.startDate)} ${t("valid.periodTo")} ${formatDate(result.endDate)}`}
            />
            <InfoRow
              icon={<FileText className="size-4" />}
              label={t("valid.status")}
              value={statusLabel}
            />
            {result.generatedAt && (
              <InfoRow
                icon={<Calendar className="size-4" />}
                label={t("valid.generatedOn")}
                value={formatDate(new Date(result.generatedAt))}
              />
            )}
          </div>

          <div className="mt-8 text-center">
            <Button variant="outline" render={<Link href="/verify" />}>
              {t("invalid.tryAgain")}
            </Button>
          </div>
        </CardContent>
      </Card>
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
  value: string
}) {
  return (
    <div className="flex items-start gap-3 py-2 border-b border-border/50 last:border-0">
      <span className="text-muted-foreground mt-0.5 shrink-0">{icon}</span>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground uppercase tracking-wider">
          {label}
        </p>
        <p className="font-medium">{value}</p>
      </div>
    </div>
  )
}
