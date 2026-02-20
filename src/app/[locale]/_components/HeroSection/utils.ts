import { Building2, GraduationCap, TrendingUp } from "lucide-react"

import type {
  HeroFeature,
  HeroHeadlineSegments,
} from "@/app/[locale]/_components/HeroSection/types"

type TranslationFn = (key: string) => string

export function buildHeroFeatures(t: TranslationFn): HeroFeature[] {
  return [
    {
      num: t("features.studentSpace.num"),
      title: t("features.studentSpace.title"),
      desc: t("features.studentSpace.desc"),
      icon: GraduationCap,
    },
    {
      num: t("features.companyPortal.num"),
      title: t("features.companyPortal.title"),
      desc: t("features.companyPortal.desc"),
      icon: Building2,
    },
    {
      num: t("features.adminDashboard.num"),
      title: t("features.adminDashboard.title"),
      desc: t("features.adminDashboard.desc"),
      icon: TrendingUp,
    },
  ]
}

export function getHeroHeadlineSegments(
  headline: string,
  headlineHighlight: string,
): HeroHeadlineSegments {
  const highlightIndex =
    headlineHighlight.trim().length > 0
      ? headline.indexOf(headlineHighlight)
      : -1
  const hasHighlight = highlightIndex !== -1

  if (!hasHighlight) {
    return {
      hasHighlight: false,
      before: headline,
      highlight: "",
      after: "",
      fallback: headline,
    }
  }

  return {
    hasHighlight: true,
    before: headline.slice(0, highlightIndex),
    highlight: headlineHighlight,
    after: headline.slice(highlightIndex + headlineHighlight.length),
    fallback: headline,
  }
}
