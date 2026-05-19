"use client"

import { Building2 } from "lucide-react"
import Image from "next/image"
import { resolvePublicUrl } from "@/lib/storage"

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

  const resolved = resolvePublicUrl(logoUrl)

  return (
    <div className="relative shrink-0">
      <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-xl ring-1 ring-border ring-offset-2 ring-offset-background overflow-hidden bg-muted flex items-center justify-center">
        {resolved ? (
          <Image
            src={resolved}
            alt={name}
            fill
            className="object-cover"
            sizes="96px"
          />
        ) : (
          <div className="flex flex-col items-center gap-1">
            <Building2 className="h-6 w-6 text-foreground/30" />
            <span className="text-foreground/50 text-[10px] font-serif font-semibold tracking-tight">
              {initials}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
