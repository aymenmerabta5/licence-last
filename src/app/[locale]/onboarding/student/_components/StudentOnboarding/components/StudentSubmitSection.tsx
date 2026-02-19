import { ArrowRight, Loader2 } from "lucide-react"
import * as motion from "motion/react-client"
import { useTranslations } from "next-intl"

import { Button } from "@/components/ui/button"
import { ease } from "@/lib/animations"
import type { OnboardingFormApi } from "@/app/[locale]/onboarding/student/_components/StudentOnboarding/components/types"

interface StudentSubmitSectionProps {
  form: OnboardingFormApi
}

export function StudentSubmitSection({ form }: StudentSubmitSectionProps) {
  const t = useTranslations("onboarding.student")

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease, delay: 0.2 }}
      className="pt-2"
    >
      <form.Subscribe selector={(state) => [state.isSubmitting] as const}>
        {([isSubmitting]) => (
          <Button
            type="submit"
            variant="editorial"
            size="editorial"
            className="h-12 w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                {t("submit")}
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        )}
      </form.Subscribe>
    </motion.div>
  )
}
