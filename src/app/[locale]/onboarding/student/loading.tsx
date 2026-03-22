import { OnboardingFormSkeleton } from "@/app/[locale]/onboarding/_components/OnboardingLoadingSkeletons"

export default function StudentOnboardingLoading() {
  return <OnboardingFormSkeleton sections={[4, 3, 3, 4, 3]} />
}
