import { Loader2, Save } from "lucide-react"
import * as motion from "motion/react-client"
import { useTranslations } from "next-intl"

import { Button } from "@/components/ui/button"
import { ease } from "@/lib/animations"

interface FormActionsProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: any
}

export function FormActions({ form }: FormActionsProps) {
  const t = useTranslations("dashboard.company.profile")

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease, delay: 0.4 }}
      className="pt-4"
    >
      <div className="h-px bg-border/30 mb-8" />
      <form.Subscribe
        selector={(state: { isSubmitting: boolean }) =>
          [state.isSubmitting] as const
        }
      >
        {([isSubmitting]: [boolean]) => (
          <Button
            type="submit"
            variant="editorial"
            size="editorial"
            className="w-full h-12 gap-2"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Save className="h-4 w-4" />
                {t("submit")}
              </>
            )}
          </Button>
        )}
      </form.Subscribe>
    </motion.div>
  )
}
