import type { ReactNode } from "react"
import { Link } from "@/i18n/routing"

export function FooterLink({
  href,
  children,
}: {
  href: string
  children: ReactNode
}) {
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
