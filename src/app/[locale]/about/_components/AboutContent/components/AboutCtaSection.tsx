import { ArrowRight } from "lucide-react"
import * as motion from "motion/react-client"
import type { AboutSectionProps } from "@/app/[locale]/about/_components/AboutContent/types"
import { Button } from "@/components/ui/button"
import { Link } from "@/i18n/routing"
import { reveal } from "@/lib/animations"

export function AboutCtaSection({ t }: AboutSectionProps) {
  return (
    <section className="border-t border-border px-4 sm:px-6 lg:px-16 py-20">
      <motion.div
        {...reveal}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="mx-auto max-w-6xl text-center"
      >
        <h2
          className="mb-3 font-serif text-heading"
          style={{ fontSize: "clamp(1.8rem, 3vw, 2.5rem)" }}
        >
          {t("cta.headline")}
        </h2>
        <p className="mb-8 text-muted-foreground">{t("cta.description")}</p>
        <Button
          variant="editorial"
          size="editorial"
          className="group"
          nativeButton={false}
          render={<Link href="/signup" />}
        >
          {t("cta.button")}
          <ArrowRight className="ms-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 [[dir=rtl]_&]:group-hover:-translate-x-1" />
        </Button>
      </motion.div>
    </section>
  )
}
