import type { ReactNode } from "react"
import { Link } from "@/i18n/routing"

export function FooterIconLink({
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
