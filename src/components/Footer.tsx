"use client"

import type { ReactNode } from "react"

import { useTranslations } from "next-intl"
import { ArrowRight, Github, Instagram, Linkedin, Twitter } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Link } from "@/i18n/routing"

export function Footer() {
  const t = useTranslations("footer")
  const year = new Date().getFullYear()
  const copyrightText = t("legal.copyright", { year })

  return (
    <footer id="about" className="bg-background text-foreground border-t border-border py-14 lg:py-14 transition-colors duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]">
      <div className="mx-auto max-w-7xl px-8 lg:px-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8">
          {/* Brand Column */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            <Link href="/" className="flex items-center gap-2">
              <span className="font-serif text-3xl tracking-tight text-heading transition-colors duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]">
                Internex<span className="text-primary">.</span>io
              </span>
            </Link>
            <p className="text-muted-foreground max-w-sm leading-relaxed text-lg">
              {t("description")}
            </p>
            <div className="flex items-center gap-4 mt-2">
              <SocialLink href="#" icon={<Twitter className="size-5" />} label={t("social.twitter")} />
              <SocialLink href="#" icon={<Github className="size-5" />} label={t("social.github")} />
              <SocialLink href="#" icon={<Linkedin className="size-5" />} label={t("social.linkedin")} />
              <SocialLink href="#" icon={<Instagram className="size-5" />} label={t("social.instagram")} />
            </div>
          </div>

          {/* Spacer for large screens */}
          <div className="hidden lg:block lg:col-span-1" />

          {/* Links Columns */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <h4 className="font-bold uppercase tracking-[0.15em] text-sm text-foreground">{t("sections.platform")}</h4>
            <div className="flex flex-col gap-3">
              <FooterLink href="/discover">{t("links.discover")}</FooterLink>
              <FooterLink href="/for-students">{t("links.forStudents")}</FooterLink>
              <FooterLink href="/for-companies">{t("links.forCompanies")}</FooterLink>
            </div>
          </div>

          <div className="lg:col-span-2 flex flex-col gap-4">
            <h4 className="font-bold uppercase tracking-[0.15em] text-sm text-foreground">{t("sections.company")}</h4>
            <div className="flex flex-col gap-3">
              <FooterLink href="/about">{t("links.aboutUs")}</FooterLink>
              <FooterLink href="/login">{t("links.signIn")}</FooterLink>
              <FooterLink href="/signup">{t("links.getStarted")}</FooterLink>
            </div>
          </div>

          {/* Newsletter Column */}
          <div className="lg:col-span-3 flex flex-col gap-4">
            <h4 className="font-bold uppercase tracking-[0.15em] text-sm text-foreground">{t("sections.newsletter")}</h4>
            <p className="text-muted-foreground text-sm">{t("newsletter.description")}</p>
            <form className="flex flex-col gap-2 mt-2" onSubmit={(e) => e.preventDefault()}>
              <div className="flex gap-2">
                <Input
                  placeholder={t("newsletter.emailPlaceholder")}
                  type="email"
                  aria-label={t("newsletter.emailPlaceholder")}
                  className="rounded-none border-t-0 border-x-0 border-b-2 border-border bg-transparent px-0 focus-visible:ring-0 focus-visible:border-primary transition-colors"
                />
              </div>
              <Button variant="editorial" className="w-full mt-2 group">
                {t("newsletter.subscribe")}{" "}
                <ArrowRight className="ms-2 h-4 w-4 group-hover:translate-x-1 [[dir=rtl]_&]:group-hover:-translate-x-1 transition-transform" />
              </Button>
            </form>
          </div>
        </div>

        <Separator className="my-12 bg-border/40" />

        <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-sm text-muted-foreground">
          <p>{copyrightText}</p>
          <div className="flex items-center gap-8">
            <Link href="/" className="hover:text-foreground transition-colors">{t("legal.privacyPolicy")}</Link>
            <Link href="/" className="hover:text-foreground transition-colors">{t("legal.termsOfService")}</Link>
            <Link href="/" className="hover:text-foreground transition-colors">{t("legal.cookiePolicy")}</Link>
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
      className="text-muted-foreground hover:text-primary transition-colors w-fit group flex items-center gap-2"
    >
      <span className="relative">
        {children}
        <span className="absolute -bottom-1 start-0 w-0 h-px bg-primary transition-all group-hover:w-full" />
      </span>
    </Link>
  )
}

function SocialLink({ href, icon, label }: { href: string; icon: ReactNode; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors border border-transparent hover:border-border"
      aria-label={label}
    >
      {icon}
    </a>
  )
}
