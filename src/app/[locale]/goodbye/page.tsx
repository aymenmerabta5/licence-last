import { ArrowRight } from "lucide-react"
import * as motion from "motion/react-client"
import { getTranslations, setRequestLocale } from "next-intl/server"
import { Separator } from "@/components/ui/separator"
import { Link } from "@/i18n/routing"
import { ease, reveal } from "@/lib/animations"

interface GoodbyePageProps {
  params: Promise<{ locale: string }>
}

export default async function GoodbyePage({ params }: GoodbyePageProps) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations("goodbye")

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground px-6 py-16">
      <div className="flex flex-col items-center text-center max-w-md">
        {/* Edition marker */}
        <motion.span
          {...reveal}
          transition={{ duration: 0.7, ease, delay: 0.1 }}
          className="text-[10px] font-medium tracking-[0.35em] uppercase text-primary mb-8 [[dir=rtl]_&]:tracking-normal"
        >
          Internex
        </motion.span>

        {/* Headline */}
        <motion.h1
          {...reveal}
          transition={{ duration: 0.7, ease, delay: 0.2 }}
          className="font-serif text-3xl md:text-4xl text-heading tracking-tight mb-4"
        >
          {t("headline")}
        </motion.h1>

        {/* Divider */}
        <motion.div
          {...reveal}
          transition={{ duration: 0.6, ease, delay: 0.3 }}
          className="w-full max-w-xs mb-6"
        >
          <Separator className="bg-border/50" />
        </motion.div>

        {/* Description */}
        <motion.p
          {...reveal}
          transition={{ duration: 0.7, ease, delay: 0.4 }}
          className="text-sm leading-relaxed font-light text-muted-foreground max-w-sm mb-10"
        >
          {t("description")}
        </motion.p>

        {/* CTA */}
        <motion.div
          {...reveal}
          transition={{ duration: 0.7, ease, delay: 0.5 }}
        >
          <Link
            href="/"
            className="rounded-none inline-flex items-center justify-center gap-3 border-2 border-secondary text-secondary bg-transparent font-bold uppercase tracking-[0.15em] transition-colors duration-300 hover:bg-secondary hover:text-secondary-foreground h-10 px-5 py-2.5 text-xs group"
          >
            {t("returnHome")}
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-2 [[dir=rtl]_&]:group-hover:-translate-x-2" />
          </Link>
        </motion.div>
      </div>
    </main>
  )
}
