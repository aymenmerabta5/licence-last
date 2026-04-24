"use client"

import { ArrowLeft } from "lucide-react"
import { useTranslations } from "next-intl"

import { buttonVariants } from "@/components/ui/button"
import { Link } from "@/i18n/routing"
import { cn } from "@/lib/utils"

export function BackButton() {
  const t = useTranslations("auth.panel")

  return (
    <Link
      href="/"
      aria-label={t("backHomeAria")}
      className={cn(
        buttonVariants({ variant: "ghost", size: "icon-sm" }),
        "-ms-2",
      )}
    >
      <ArrowLeft className="size-5 in-[[dir=rtl]]:rotate-180 transition-transform" />
    </Link>
  )
}
