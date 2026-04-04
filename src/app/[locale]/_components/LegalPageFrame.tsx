import { MarqueeRibbon } from "@/app/[locale]/_components/MarqueeRibbon"
import { Footer } from "@/components/Footer"
import { Navbar } from "@/components/Navbar"

interface LegalPageSection {
  body: string
  title: string
}

interface LegalPageFrameProps {
  intro: string
  kicker: string
  sections: LegalPageSection[]
  title: string
  updatedAt: string
}

export function LegalPageFrame({
  intro,
  kicker,
  sections,
  title,
  updatedAt,
}: LegalPageFrameProps) {
  return (
    <main className="min-h-screen overflow-x-clip bg-background text-foreground transition-colors duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]">
      <Navbar />
      <MarqueeRibbon />

      <section className="mx-auto flex w-full max-w-4xl flex-col gap-10 px-6 py-14 sm:px-8 lg:px-12">
        <header className="space-y-4 border-b border-border/60 pb-8">
          <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-primary [[dir=rtl]_&]:tracking-normal">
            {kicker}
          </p>
          <div className="space-y-3">
            <h1 className="font-serif text-[clamp(2.25rem,5vw,3.5rem)] leading-[1.05] tracking-tight text-heading">
              {title}
            </h1>
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-muted-foreground [[dir=rtl]_&]:tracking-normal">
              {updatedAt}
            </p>
            <p className="max-w-3xl text-base leading-8 text-muted-foreground">
              {intro}
            </p>
          </div>
        </header>

        <div className="space-y-8">
          {sections.map((section) => (
            <article
              key={section.title}
              className="space-y-3 rounded-none border border-border/50 bg-background/60 p-6 sm:p-8"
            >
              <h2 className="font-serif text-2xl tracking-tight text-heading">
                {section.title}
              </h2>
              <p className="text-sm leading-7 text-muted-foreground">
                {section.body}
              </p>
            </article>
          ))}
        </div>
      </section>

      <Footer />
    </main>
  )
}
