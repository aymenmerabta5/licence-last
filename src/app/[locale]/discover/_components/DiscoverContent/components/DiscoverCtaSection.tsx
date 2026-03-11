import { ArrowRight } from "lucide-react"
import * as motion from "motion/react-client"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Link } from "@/i18n/routing"
import { reveal } from "@/lib/animations"
import type { DiscoverSectionProps } from "@/app/[locale]/discover/_components/DiscoverContent/types"

export function DiscoverCtaSection({ t }: DiscoverSectionProps) {
  return (
    <section className="border-t border-border px-8 lg:px-16 py-20">
      <motion.div
        {...reveal}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="mx-auto flex max-w-6xl flex-col items-center justify-center gap-8 sm:flex-row"
      >
        <div className="text-center sm:text-start">
          <h2 className="font-serif text-2xl text-heading">
            {t("cta.headline")}
          </h2>
          <p className="mt-2 text-muted-foreground">{t("cta.description")}</p>
        </div>
        <Separator
          orientation="vertical"
          className="hidden h-12 bg-border/50 sm:block"
        />
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
