"use client"

import { Building2 } from "lucide-react"
import Image from "next/image"

interface CompanyLogoProps {
  logoUrl: string | null
  name: string
}

export function CompanyLogo({ logoUrl, name }: CompanyLogoProps) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()

  return (
    <div className="relative shrink-0">
      <div className="h-24 w-24 sm:h-28 sm:w-28 rounded-2xl p-[3px] bg-gradient-to-tr from-primary/30 via-primary/10 to-transparent">
        <div className="h-full w-full rounded-2xl overflow-hidden bg-muted flex items-center justify-center border-[3px] border-background shadow-xl relative">
          {logoUrl ? (
            <Image
              src={logoUrl}
              alt={name}
              fill
              className="object-cover"
              sizes="112px"
            />
          ) : (
            <div className="flex flex-col items-center gap-1">
              <Building2 className="h-7 w-7 text-foreground/30" />
              <span className="text-foreground/50 text-xs font-serif font-semibold tracking-tight">
                {initials}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
