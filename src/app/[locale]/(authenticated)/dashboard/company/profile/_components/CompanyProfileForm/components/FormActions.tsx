import * as motion from "motion/react-client"
import { useTranslations } from "next-intl"
import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { reveal, ease } from "@/lib/animations"

interface FormActionsProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: any
}

export function FormActions({ form }: FormActionsProps) {
  const t = useTranslations("dashboard.company.profile")

  return (
    <motion.div
      {...reveal}
      transition={{ duration: 0.6, ease, delay: 0.2 }}
    >
      <form.Subscribe selector={(state: { isSubmitting: boolean }) => [state.isSubmitting] as const}>
        {([isSubmitting]: [boolean]) => (
          <Button
            type="submit"
            variant="editorial"
            size="editorial"
            className="w-full h-12"
            disabled={isSubmitting}
          >
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : t("submit")}
          </Button>
        )}
      </form.Subscribe>
    </motion.div>
  )
}
