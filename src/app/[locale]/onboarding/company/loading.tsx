import { OnboardingFormSkeleton } from "@/app/[locale]/onboarding/_components/OnboardingLoadingSkeletons"

export default function CompanyOnboardingLoading() {
  return <OnboardingFormSkeleton sections={[4, 3]} />
}
