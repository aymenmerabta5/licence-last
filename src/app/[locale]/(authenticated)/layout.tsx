import { requireRole } from "@/lib/auth-guards"
import { DashboardClientProvider } from "@/app/[locale]/(authenticated)/_components/DashboardClientProvider"

export default async function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await requireRole(["student", "company_admin", "admin", "super_admin"])

  return (
    <DashboardClientProvider user={user}>
      {children}
    </DashboardClientProvider>
  )
}
