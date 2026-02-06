import { useTranslations } from "next-intl"
import { Star } from "lucide-react"

export function MarqueeRibbon() {
  const t = useTranslations("marquee")
  const items = t.raw("items") as string[]

  return (
    <div
      className="overflow-hidden py-3 bg-secondary dark:bg-primary ed-smooth"
      aria-label={t("aria")}
    >
      <div className="ed-marquee flex whitespace-nowrap gap-12">
        {[...Array(2)].map((_, setIdx) => (
          <div key={setIdx} className="flex items-center gap-12 shrink-0">
            {items.map((txt, i) => (
              <span key={i} className="flex items-center gap-3">
                <Star
                  className="h-3 w-3 text-primary dark:text-primary-foreground ed-smooth"
                  aria-hidden="true"
                />
                <span className="text-xs font-semibold tracking-[0.2em] text-secondary-foreground dark:text-primary-foreground ed-smooth">
                  {txt}
                </span>
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
