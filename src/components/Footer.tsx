"use client"

import * as React from "react"
import Link from "next/link"
import { ArrowRight, Github, Instagram, Linkedin, Twitter } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"

export function Footer() {
  return (
    <footer className="bg-background text-foreground border-t border-border py-14 lg:py-14 ed-smooth">
      <div className="mx-auto max-w-7xl px-8 lg:px-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8">
          {/* Brand Column */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            <Link href="/" className="flex items-center gap-2">
              <span className="font-serif text-3xl tracking-tight text-heading ed-smooth">
                Internex<span className="text-primary">.</span>io
              </span>
            </Link>
            <p className="text-muted-foreground max-w-sm leading-relaxed text-lg">
              Connecting the brightest students with world-class opportunities. 
              The future of internships starts here.
            </p>
            <div className="flex items-center gap-4 mt-2">
              <SocialLink href="#" icon={<Twitter className="size-5" />} label="Twitter" />
              <SocialLink href="#" icon={<Github className="size-5" />} label="GitHub" />
              <SocialLink href="#" icon={<Linkedin className="size-5" />} label="LinkedIn" />
              <SocialLink href="#" icon={<Instagram className="size-5" />} label="Instagram" />
            </div>
          </div>

          {/* Spacer for large screens */}
          <div className="hidden lg:block lg:col-span-1" />

          {/* Links Columns */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <h4 className="font-bold uppercase tracking-[0.15em] text-sm text-foreground">Platform</h4>
            <div className="flex flex-col gap-3">
              <FooterLink href="#">Discover</FooterLink>
              <FooterLink href="#">For Students</FooterLink>
              <FooterLink href="#">For Recruiters</FooterLink>
              <FooterLink href="#">Pricing</FooterLink>
            </div>
          </div>

          <div className="lg:col-span-2 flex flex-col gap-4">
            <h4 className="font-bold uppercase tracking-[0.15em] text-sm text-foreground">Company</h4>
            <div className="flex flex-col gap-3">
              <FooterLink href="#">About Us</FooterLink>
              <FooterLink href="#">Careers</FooterLink>
              <FooterLink href="#">Blog</FooterLink>
              <FooterLink href="#">Contact</FooterLink>
            </div>
          </div>

          {/* Newsletter Column */}
          <div className="lg:col-span-3 flex flex-col gap-4">
            <h4 className="font-bold uppercase tracking-[0.15em] text-sm text-foreground">Stay Updated</h4>
            <p className="text-muted-foreground text-sm">
              Subscribe to our newsletter for the latest internship opportunities and career tips.
            </p>
            <form className="flex flex-col gap-2 mt-2" onSubmit={(e) => e.preventDefault()}>
              <div className="flex gap-2">
                <Input 
                  placeholder="Enter your email" 
                  type="email" 
                  className="rounded-none border-t-0 border-x-0 border-b-2 border-border bg-transparent px-0 focus-visible:ring-0 focus-visible:border-primary transition-colors"
                />
              </div>
              <Button variant="editorial" className="w-full mt-2 group">
                Subscribe <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </form>
          </div>
        </div>

        <Separator className="my-12 bg-border/40" />

        <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-sm text-muted-foreground">
          <p>© 2025 Internex.io. All rights reserved.</p>
          <div className="flex items-center gap-8">
            <Link href="/" className="hover:text-foreground transition-colors">Privacy Policy</Link>
            <Link href="/" className="hover:text-foreground transition-colors">Terms of Service</Link>
            <Link href="/" className="hover:text-foreground transition-colors">Cookie Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  // Using <a> tag to avoid typed-route errors with placeholder '#' links
  // In a real app, these would be <Link> with valid routes like "/about"
  return (
    <Link 
      href={href} 
      className="text-muted-foreground hover:text-primary transition-colors w-fit group flex items-center gap-2"
    >
      <span className="relative">
        {children}
        <span className="absolute -bottom-1 left-0 w-0 h-px bg-primary transition-all group-hover:w-full" />
      </span>
    </Link>
  )
}

function SocialLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
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
