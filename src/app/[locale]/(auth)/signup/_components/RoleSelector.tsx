"use client"

import { ArrowRight, Building2, GraduationCap, School } from "lucide-react"
import * as motion from "motion/react-client"
import { useTranslations } from "next-intl"

import { ease, reveal } from "@/lib/animations"

type SelectedRole = "student" | "company_admin" | "university_admin"

interface RoleSelectorProps {
  onSelect: (role: SelectedRole) => void
}

const roles = [
  { key: "student" as const, Icon: GraduationCap },
  { key: "company_admin" as const, Icon: Building2 },
  { key: "university_admin" as const, Icon: School },
]

const translationKey: Record<string, string> = {
  student: "student",
  company_admin: "company",
  university_admin: "university",
}

export function RoleSelector({ onSelect }: RoleSelectorProps) {
  const t = useTranslations("auth.signup.roleSelection")

  return (
    <div className="space-y-7">
      <motion.div {...reveal} transition={{ duration: 0.6, ease }}>
        <h1 className="font-serif text-3xl text-heading tracking-tight mb-2 transition-colors duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]">
          {t("title")}
        </h1>
        <p className="text-sm text-muted-foreground font-light transition-colors duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]">
          {t("subtitle")}
        </p>
      </motion.div>

      <div className="grid gap-4">
        {roles.map(({ key, Icon }, i) => (
          <motion.button
            key={key}
            type="button"
            {...reveal}
            transition={{ duration: 0.6, ease, delay: 0.1 + i * 0.1 }}
            onClick={() => onSelect(key)}
            className="group relative flex items-start gap-4 p-5 text-start border border-border bg-background hover:border-primary/40 hover:bg-primary/[0.02] transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] cursor-pointer"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-border group-hover:border-primary/40 transition-colors duration-300">
              <Icon className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors duration-300" />
            </div>
            <div className="flex-1 space-y-1">
              <p className="font-serif text-lg text-heading transition-colors duration-300">
                {t(`${translationKey[key]}.title`)}
              </p>
              <p className="text-sm text-muted-foreground font-light leading-relaxed">
                {t(`${translationKey[key]}.description`)}
              </p>
            </div>
            <ArrowRight className="h-4 w-4 mt-3 shrink-0 text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-1 transition-all duration-300 [[dir=rtl]_&]:rotate-180 [[dir=rtl]_&]:group-hover:-translate-x-1" />
          </motion.button>
        ))}
      </div>
    </div>
  )
}
