import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { DashboardClientProvider } from "@/app/[locale]/(authenticated)/_components/DashboardClientProvider"

export default async function AuthenticatedLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  await params
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  // ⚠️ PREVIEW MODE: Hardware dummy user
  const user = session?.user || {
    name: "Preview User",
    email: "preview@example.com",
    role: "student",
  }

  return (
    <DashboardClientProvider user={user}>
      {children}
    </DashboardClientProvider>
  )
}
