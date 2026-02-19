import { Building2, GraduationCap, Landmark } from "lucide-react"
import type { LucideIcon } from "lucide-react"

import { usePathname } from "@/i18n/routing"

export type OnboardingRole = "company" | "student" | "university"

interface RoleConfig {
  namespace: "onboarding.company" | "onboarding.student" | "onboarding.university"
  icon: LucideIcon
  patternOpacity: string
}

const ROLE_MAP: Record<OnboardingRole, RoleConfig> = {
  company: {
    namespace: "onboarding.company",
    icon: Building2,
    patternOpacity: "opacity-[0.03]",
  },
  student: {
    namespace: "onboarding.student",
    icon: GraduationCap,
    patternOpacity: "opacity-[0.04]",
  },
  university: {
    namespace: "onboarding.university",
    icon: Landmark,
    patternOpacity: "opacity-[0.03]",
  },
}

function detectRole(pathname: string): OnboardingRole {
  if (pathname.includes("/onboarding/company")) return "company"
  if (pathname.includes("/onboarding/student")) return "student"
  if (pathname.includes("/onboarding/university")) return "university"
  return "student"
}

export function useOnboardingRoleConfig() {
  const pathname = usePathname()
  const role = detectRole(pathname)
  return { role, config: ROLE_MAP[role] }
}

const GRAIN_TEXTURE_DATA_URL = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`

export function GrainTextureOverlay() {
  return (
    <div
      className="pointer-events-none absolute inset-0 opacity-[0.1] mix-blend-overlay"
      style={{ backgroundImage: GRAIN_TEXTURE_DATA_URL, backgroundSize: "128px 128px" }}
      aria-hidden="true"
    />
  )
}

interface GridPatternOverlayProps {
  patternId: string
  opacityClass: string
  size: number
}

export function GridPatternOverlay({ patternId, opacityClass, size }: GridPatternOverlayProps) {
  return (
    <div className={`pointer-events-none absolute inset-0 ${opacityClass}`} aria-hidden="true">
      <svg width="100%" height="100%" className="text-foreground">
        <defs>
          <pattern id={patternId} width={size} height={size} patternUnits="userSpaceOnUse">
            <path d={`M ${size} 0 L 0 0 0 ${size}`} fill="none" stroke="currentColor" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#${patternId})`} />
      </svg>
    </div>
  )
}
