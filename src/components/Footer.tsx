"use client"

import {
  ArrowRight,
  BookOpen,
  Compass,
  Github,
  ShieldCheck,
} from "lucide-react"

import { useTranslations } from "next-intl"
import { type ReactNode, useState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Link } from "@/i18n/routing"
import { toast } from "sonner"

export function Footer() {
  const t = useTranslations("footer")
  const [newsletterEmail, setNewsletterEmail] = useState("")
  const [error, setError] = useState("")
  const year = new Date().getFullYear()
  const copyrightText = t("legal.copyright", { year })

  return (
    <footer
      id="about"
      className="bg-background text-foreground border-t border-border py-10 sm:py-12 lg:py-14 transition-colors duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]"
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 sm:gap-10 lg:gap-8">
          {/* Brand Column */}
          <div className="lg:col-span-4 flex flex-col gap-4 sm:gap-6">
            <Link href="/" className="flex items-center gap-2">
              <span className="font-serif text-2xl sm:text-3xl tracking-tight text-heading transition-colors duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]">
                Stag<span className="text-primary">.</span>io
              </span>
            </Link>
            <p className="max-w-sm text-sm sm:text-base lg:text-lg leading-relaxed text-muted-foreground">
              {t("description")}
            </p>
            <div className="mt-1 sm:mt-2 flex flex-wrap items-center gap-3 sm:gap-4">
              <FooterIconLink
                external
                href="https://github.com/aymenmerabta5/licence-last"
                icon={<Github className="size-5" />}
                label={t("social.github")}
              />
              <FooterIconLink
                href="/about"
                icon={<BookOpen className="size-5" />}
                label={t("links.aboutUs")}
              />
              <FooterIconLink
                href="/discover"
                icon={<Compass className="size-5" />}
                label={t("links.discover")}
              />
              <FooterIconLink
                href="/privacy"
                icon={<ShieldCheck className="size-5" />}
                label={t("legal.privacyPolicy")}
              />
            </div>
          </div>

          {/* Spacer for large screens */}
          <div className="hidden lg:block lg:col-span-1" />

          {/* Links Columns */}
          <div className="lg:col-span-2 flex flex-col gap-3 sm:gap-4">
            <h4 className="font-bold uppercase tracking-[0.15em] text-sm text-foreground">
              {t("sections.platform")}
            </h4>
            <div className="flex flex-col gap-2.5 sm:gap-3">
              <FooterLink href="/discover">{t("links.discover")}</FooterLink>
              <FooterLink href="/for-students">
                {t("links.forStudents")}
              </FooterLink>
              <FooterLink href="/for-companies">
                {t("links.forCompanies")}
              </FooterLink>
            </div>
          </div>

          <div className="lg:col-span-2 flex flex-col gap-3 sm:gap-4">
            <h4 className="font-bold uppercase tracking-[0.15em] text-sm text-foreground">
              {t("sections.company")}
            </h4>
            <div className="flex flex-col gap-2.5 sm:gap-3">
              <FooterLink href="/about">{t("links.aboutUs")}</FooterLink>
              <FooterLink href="/login">{t("links.signIn")}</FooterLink>
              <FooterLink href="/signup">{t("links.getStarted")}</FooterLink>
            </div>
          </div>

          {/* Newsletter Column */}
          <div className="lg:col-span-3 flex flex-col gap-3 sm:gap-4">
            <h4 className="font-bold uppercase tracking-[0.15em] text-sm text-foreground">
              {t("sections.newsletter")}
            </h4>
            <p className="text-muted-foreground text-sm">
              {t("newsletter.description")}
            </p>

            <form
              className="mt-1 sm:mt-2 flex flex-col gap-2"
              onSubmit={(e) => {
                e.preventDefault()
                const email = newsletterEmail.trim()

                if (!email) {
                  setError("Please enter your email address.")
                  return
                }

                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
                if (!emailRegex.test(email)) {
                  setError("Please enter a valid email address.")
                  return
                }

                setError("")
                
                toast.success("Thank you!", {
                  description: "Your email has been received.",
                  position: "bottom-center",
                  duration: 3000,

                })

                setNewsletterEmail("")
              }}
            >
              <div className="flex gap-2">
                <Input
                  placeholder={t("newsletter.emailPlaceholder")}
                  type="email"
                  required
                  value={newsletterEmail}
                  onChange={(event) => {
                    setNewsletterEmail(event.target.value)
                    if (error) setError("")
                  }}
                  aria-label={t("newsletter.emailPlaceholder")}
                  className="rounded-none border-t-0 border-x-0 border-b-2 border-border bg-transparent px-0 focus-visible:ring-0 focus-visible:border-primary transition-colors"
                />
              </div>
              {error && (
                <p className="text-xs text-red-500 mt-1">{error}</p>
              )}
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
        </div>

        <Separator className="my-8 sm:my-12 bg-border/40" />

        <div className="flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6 text-xs sm:text-sm text-center md:text-start text-muted-foreground">
          <p>{copyrightText}</p>
          <div className="flex flex-wrap items-center justify-center md:justify-end gap-x-5 gap-y-2 sm:gap-8">
            <Link
              href="/privacy"
              className="hover:text-foreground transition-colors"
            >
              {t("legal.privacyPolicy")}
            </Link>
            <Link
              href="/terms"
              className="hover:text-foreground transition-colors"
            >
              {t("legal.termsOfService")}
            </Link>
            <Link
              href="/cookies"
              className="hover:text-foreground transition-colors"
            >
              {t("legal.cookiePolicy")}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

function FooterLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href as Parameters<typeof Link>[0]["href"]}
      className="w-fit group flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
    >
      <span className="relative">
        {children}
        <span className="absolute -bottom-1 start-0 w-0 h-px bg-primary transition-all group-hover:w-full" />
      </span>
    </Link>
  )
}

function FooterIconLink({
  href,
  external = false,
  icon,
  label,
}: {
  href: string
  external?: boolean
  icon: ReactNode
  label: string
}) {
  const className =
    "p-2 sm:p-2.5 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors border border-transparent hover:border-border"

  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
        aria-label={label}
      >
        {icon}
      </a>
    )
  }

  return (
    <Link
      href={href as Parameters<typeof Link>[0]["href"]}
      className={className}
      aria-label={label}
    >
      {icon}
    </Link>
  )
}
