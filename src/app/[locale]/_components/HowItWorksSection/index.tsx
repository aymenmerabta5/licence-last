import { ArrowRight } from "lucide-react"
import * as motion from "motion/react-client"
import { useTranslations } from "next-intl"
import { buildUserTypes } from "@/app/[locale]/_components/HowItWorksSection/buildUserTypes"
import { UserTypeColumn } from "@/app/[locale]/_components/HowItWorksSection/components/UserTypeColumn"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Link } from "@/i18n/routing"
import { reveal } from "@/lib/animations"

export function HowItWorksSection() {
  const t = useTranslations("howItWorks")
  const userTypes = buildUserTypes(t)

  return (
    <section className="relative px-5 sm:px-8 lg:px-16 py-14 sm:py-24 overflow-hidden">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute -start-8 top-1/4 font-serif text-[20rem] font-bold leading-none text-foreground/[0.02] dark:text-foreground/[0.015] select-none">
          ∞
        </div>
        <div className="absolute top-1/2 start-1/2 -translate-x-1/2 -translate-y-1/2 h-[50rem] w-[50rem] rounded-full bg-primary/3 blur-3xl opacity-0 dark:opacity-100" />
      </div>

      <div className="relative mx-auto max-w-6xl">
        <div className="mb-10 sm:mb-16 max-w-2xl">
          <motion.div
            {...reveal}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="flex items-center gap-3 mb-6"
          >
            <span className="text-xs font-bold tracking-[0.2em] uppercase text-primary [[dir=rtl]_&]:tracking-normal">
              {t("label")}
            </span>
            <Separator className="flex-1 bg-border/50 transition-colors duration-500" />
          </motion.div>

          <motion.h2
            {...reveal}
            transition={{ duration: 0.7, ease: "easeOut", delay: 0.1 }}
            className="font-serif text-heading transition-colors duration-500"
            style={{
              fontSize: "clamp(2rem, 7vw, 4rem)",
              lineHeight: 1.15,
              letterSpacing: "-0.02em",
              textWrap: "balance",
            }}
          >
            {t("headline")}
          </motion.h2>

          <motion.p
            {...reveal}
            transition={{ duration: 0.7, ease: "easeOut", delay: 0.2 }}
            className="mt-6 text-lg leading-relaxed text-muted-foreground transition-colors duration-500"
          >
            {t("description")}
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 sm:gap-12 lg:gap-8">
          {userTypes.map((userType, index) => (
            <UserTypeColumn key={index} columnIndex={index} {...userType} />
          ))}
        </div>

        <motion.div
          {...reveal}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.8 }}
          className="mt-16 flex flex-col sm:flex-row items-center justify-center gap-6 pt-12 border-t border-border transition-colors duration-500"
        >
          <p className="text-muted-foreground text-center sm:text-start">
            {t("cta.text")}
          </p>
          <Button
            variant="editorial"
            size="editorial"
            nativeButton={false}
            render={<Link href="/login" />}
            aria-label={t("cta.aria")}
          >
            {t("cta.button")}
          </Button>
        </motion.div>
      </div>
    </section>
  )
}
