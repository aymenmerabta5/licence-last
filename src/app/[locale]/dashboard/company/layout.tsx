import { requireRole } from "@/lib/auth-guards"

export default async function CompanyDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requireRole(["company_admin"])
  return <>{children}</>
}
