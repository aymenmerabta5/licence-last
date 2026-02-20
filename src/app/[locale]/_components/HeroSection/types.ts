import type { LucideIcon } from "lucide-react"

export interface HeroFeature {
  num: string
  title: string
  desc: string
  icon: LucideIcon
}

export interface HeroHeadlineSegments {
  hasHighlight: boolean
  before: string
  highlight: string
  after: string
  fallback: string
}

export interface HeroContentProps {
  volumeLabel: string
  headline: HeroHeadlineSegments
  descriptionPrimary: string
  descriptionSecondary: string
  ctaLabel: string
  ctaAriaLabel: string
  freeForStudentsLabel: string
  prefersReducedMotion: boolean
}
