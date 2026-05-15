"use client"

import { ArrowRight } from "lucide-react"
import { useTranslations } from "next-intl"

import { useNewsletterForm } from "@/components/Footer/hooks/useNewsletterForm"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function NewsletterSection() {
  const t = useTranslations("footer")
  const { newsletterEmail, error, handleSubmit, handleChange } =
    useNewsletterForm()

  return (
    <div className="lg:col-span-3 flex flex-col gap-3 sm:gap-4">
      <h4 className="font-bold uppercase tracking-[0.15em] text-sm text-foreground">
        {t("sections.newsletter")}
      </h4>
      <p className="text-muted-foreground text-sm">
        {t("newsletter.description")}
      </p>

      <form
        className="mt-1 sm:mt-2 flex flex-col gap-2"
        onSubmit={handleSubmit}
      >
        <div className="flex gap-2">
          <Input
            placeholder={t("newsletter.emailPlaceholder")}
            type="email"
            required
            value={newsletterEmail}
            onChange={(event) => handleChange(event.target.value)}
            aria-label={t("newsletter.emailPlaceholder")}
            className="rounded-none border-t-0 border-x-0 border-b-2 border-border bg-transparent px-0 focus-visible:ring-0 focus-visible:border-primary transition-colors"
          />
        </div>
        {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
        <Button
          type="submit"
          variant="editorial"
          className="mt-1 sm:mt-2 w-full group"
        >
          {t("newsletter.subscribe")}{" "}
          <ArrowRight className="ms-2 h-4 w-4 group-hover:translate-x-1 [[dir=rtl]_&]:group-hover:-translate-x-1 transition-transform" />
        </Button>
      </form>
    </div>
  )
}
