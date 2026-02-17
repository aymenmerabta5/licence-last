import {
  BarChart3,
  Briefcase,
  Building2,
  CheckCircle2,
  FileCheck,
  FileText,
  GraduationCap,
  Search,
  Send,
  ShieldCheck,
  UserPlus,
  Users,
} from "lucide-react"

import type { UserTypeData } from "@/app/[locale]/_components/HowItWorksSection/types"

type TranslationFn = (key: string) => string

export function buildUserTypes(t: TranslationFn): UserTypeData[] {
  return [
    {
      id: "for-students",
      icon: GraduationCap,
      title: t("student.title"),
      subtitle: t("student.subtitle"),
      accentClass: "bg-primary/10 text-primary",
      steps: [
        {
          icon: UserPlus,
          title: t("student.steps.register.title"),
          description: t("student.steps.register.description"),
          stepNumber: t("student.steps.register.step"),
        },
        {
          icon: FileText,
          title: t("student.steps.profile.title"),
          description: t("student.steps.profile.description"),
          stepNumber: t("student.steps.profile.step"),
        },
        {
          icon: Search,
          title: t("student.steps.search.title"),
          description: t("student.steps.search.description"),
          stepNumber: t("student.steps.search.step"),
        },
        {
          icon: Send,
          title: t("student.steps.apply.title"),
          description: t("student.steps.apply.description"),
          stepNumber: t("student.steps.apply.step"),
        },
      ],
    },
    {
      id: "for-recruiters",
      icon: Building2,
      title: t("company.title"),
      subtitle: t("company.subtitle"),
      accentClass:
        "bg-secondary/10 text-secondary dark:bg-secondary/20 dark:text-secondary",
      steps: [
        {
          icon: Briefcase,
          title: t("company.steps.profile.title"),
          description: t("company.steps.profile.description"),
          stepNumber: t("company.steps.profile.step"),
        },
        {
          icon: FileText,
          title: t("company.steps.offers.title"),
          description: t("company.steps.offers.description"),
          stepNumber: t("company.steps.offers.step"),
        },
        {
          icon: Users,
          title: t("company.steps.candidates.title"),
          description: t("company.steps.candidates.description"),
          stepNumber: t("company.steps.candidates.step"),
        },
        {
          icon: CheckCircle2,
          title: t("company.steps.accept.title"),
          description: t("company.steps.accept.description"),
          stepNumber: t("company.steps.accept.step"),
        },
      ],
    },
    {
      icon: ShieldCheck,
      title: t("admin.title"),
      subtitle: t("admin.subtitle"),
      accentClass: "bg-chart-3/10 text-chart-3 dark:bg-chart-3/20",
      steps: [
        {
          icon: CheckCircle2,
          title: t("admin.steps.validate.title"),
          description: t("admin.steps.validate.description"),
          stepNumber: t("admin.steps.validate.step"),
        },
        {
          icon: FileCheck,
          title: t("admin.steps.documents.title"),
          description: t("admin.steps.documents.description"),
          stepNumber: t("admin.steps.documents.step"),
        },
        {
          icon: BarChart3,
          title: t("admin.steps.statistics.title"),
          description: t("admin.steps.statistics.description"),
          stepNumber: t("admin.steps.statistics.step"),
        },
      ],
    },
  ]
}

