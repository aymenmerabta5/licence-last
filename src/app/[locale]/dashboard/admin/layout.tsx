import { requireRole } from "@/lib/auth-guards"

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requireRole(["admin", "super_admin"])
  return <>{children}</>
}
