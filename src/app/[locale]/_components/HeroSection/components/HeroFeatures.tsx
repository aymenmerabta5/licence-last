import { HeroFeatureCard } from "@/app/[locale]/_components/HeroFeatureCard"
import type { HeroFeature } from "@/app/[locale]/_components/HeroSection/types"

interface HeroFeaturesProps {
  features: HeroFeature[]
  prefersReducedMotion: boolean
}

export function HeroFeatures({
  features,
  prefersReducedMotion,
}: HeroFeaturesProps) {
  return (
    <div className="flex flex-col gap-5 lg:col-span-5">
      {features.map((item, index) => (
        <HeroFeatureCard
          key={index}
          index={index}
          prefersReducedMotion={prefersReducedMotion}
          {...item}
        />
      ))}
    </div>
  )
}
