import * as motion from "motion/react-client"
import {
    GraduationCap,
    Building2,
    ShieldCheck,
    UserPlus,
    FileText,
    Search,
    Send,
    Briefcase,
    Users,
    CheckCircle2,
    FileCheck,
    BarChart3,
    ArrowRight,
} from "lucide-react"
import { useTranslations } from "next-intl"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import type { LucideIcon } from "lucide-react"
import { reveal, ease } from "@/lib/animations"

/* ── Workflow Step Card ── */
function WorkflowStep({
    icon: Icon,
    title,
    description,
    stepNumber,
    index,
}: {
    icon: LucideIcon
    title: string
    description: string
    stepNumber: string
    index: number
}) {
    return (
        <motion.div
            {...reveal}
            transition={{ duration: 0.6, ease, delay: 0.3 + index * 0.1 }}
            className="group relative"
        >
            {/* Connecting line for non-last items */}
            <div className="flex items-start gap-4">
                {/* Step indicator */}
                <div className="relative flex flex-col items-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-primary/30 bg-background transition-all duration-300 group-hover:border-primary group-hover:bg-primary/5">
                        <Icon className="h-5 w-5 text-primary transition-colors duration-300" />
                    </div>
                    <div className="mt-2 h-full w-px bg-gradient-to-b from-primary/20 to-transparent" />
                </div>

                {/* Content */}
                <div className="flex-1 pb-8">
                    <span className="font-serif text-xs font-bold tracking-[0.2em] uppercase text-primary/60 [[dir=rtl]_&]:tracking-normal">
                        {stepNumber}
                    </span>
                    <h4 className="mt-1 font-serif text-lg text-heading transition-colors duration-500">
                        {title}
                    </h4>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground transition-colors duration-500">
                        {description}
                    </p>
                </div>
            </div>
        </motion.div>
    )
}

/* ── User Type Column ── */
function UserTypeColumn({
    id,
    icon: Icon,
    title,
    subtitle,
    steps,
    columnIndex,
    accentClass,
}: {
    id?: string
    icon: LucideIcon
    title: string
    subtitle: string
    steps: Array<{ icon: LucideIcon; title: string; description: string; stepNumber: string }>
    columnIndex: number
    accentClass: string
}) {
    return (
        <motion.div
            id={id}
            {...reveal}
            transition={{ duration: 0.7, ease, delay: 0.2 + columnIndex * 0.15 }}
            className="relative flex flex-col"
        >
            {/* Header */}
            <div className="mb-8 border-b-2 border-foreground dark:border-foreground/15 pb-6 transition-colors duration-500">
                <div className="flex items-center gap-3 mb-3">
                    <div className={`p-2 rounded-lg ${accentClass}`}>
                        <Icon className="h-6 w-6" />
                    </div>
                    <span className="text-xs font-bold tracking-[0.2em] uppercase text-foreground/40 [[dir=rtl]_&]:tracking-normal">
                        {subtitle}
                    </span>
                </div>
                <h3 className="font-serif text-2xl text-heading transition-colors duration-500">
                    {title}
                </h3>
            </div>

            {/* Steps */}
            <div className="flex flex-col">
                {steps.map((step, i) => (
                    <WorkflowStep key={i} index={i + columnIndex * 4} {...step} />
                ))}
            </div>
        </motion.div>
    )
}

/* ── How It Works Section ── */
export function HowItWorksSection() {
    const t = useTranslations("howItWorks")

    const userTypes = [
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
            accentClass: "bg-secondary/10 text-secondary dark:bg-secondary/20 dark:text-secondary",
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

    return (
        <section className="relative px-8 lg:px-16 py-24 overflow-hidden">
            {/* Decorative background elements */}
            <div className="pointer-events-none absolute inset-0" aria-hidden="true">
                {/* Large decorative number */}
                <div className="absolute -start-8 top-1/4 font-serif text-[20rem] font-bold leading-none text-foreground/[0.02] dark:text-foreground/[0.015] select-none">
                    ∞
                </div>
                {/* Warm glow — only visible in dark mode */}
                <div className="absolute top-1/2 start-1/2 -translate-x-1/2 -translate-y-1/2 h-[50rem] w-[50rem] rounded-full bg-primary/3 blur-3xl opacity-0 dark:opacity-100" />
            </div>

            <div className="relative mx-auto max-w-6xl">
                {/* Section Header */}
                <div className="mb-16 max-w-2xl">
                    <motion.div
                        {...reveal}
                        transition={{ duration: 0.7, ease: "easeOut" }}
                        className="flex items-center gap-3 mb-6"
                    >
                        <span className="text-xs font-bold tracking-[0.2em] uppercase text-primary [[dir=rtl]_&]:tracking-normal">
                            {t("label")}
                        </span>
                        <Separator className="flex-1 bg-border/50 transition-colors duration-500" />
                    </motion.div>

                    <motion.h2
                        {...reveal}
                        transition={{ duration: 0.7, ease: "easeOut", delay: 0.1 }}
                        className="font-serif text-heading transition-colors duration-500"
                        style={{
                            fontSize: "clamp(2.5rem, 5vw, 4rem)",
                            lineHeight: 1.1,
                            letterSpacing: "-0.02em",
                        }}
                    >
                        {t("headline")}
                    </motion.h2>

                    <motion.p
                        {...reveal}
                        transition={{ duration: 0.7, ease: "easeOut", delay: 0.2 }}
                        className="mt-6 text-lg leading-relaxed text-muted-foreground transition-colors duration-500"
                    >
                        {t("description")}
                    </motion.p>
                </div>

                {/* Three Column Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 lg:gap-8">
                    {userTypes.map((userType, index) => (
                        <UserTypeColumn key={index} columnIndex={index} {...userType} />
                    ))}
                </div>

                {/* CTA */}
                <motion.div
                    {...reveal}
                    transition={{ duration: 0.7, ease: "easeOut", delay: 0.8 }}
                    className="mt-16 flex flex-col sm:flex-row items-center justify-center gap-6 pt-12 border-t border-border transition-colors duration-500"
                >
                    <p className="text-muted-foreground text-center sm:text-start">
                        {t("cta.text")}
                    </p>
                    <Button
                        variant="editorial"
                        size="editorial"
                        className="group"
                        aria-label={t("cta.aria")}
                    >
                        {t("cta.button")}
                        <ArrowRight className="ms-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 [[dir=rtl]_&]:group-hover:-translate-x-1" />
                    </Button>
                </motion.div>
            </div>
        </section>
    )
}
