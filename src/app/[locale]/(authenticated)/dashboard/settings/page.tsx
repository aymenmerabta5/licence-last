import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { getLocale } from "next-intl/server"

import { auth } from "@/lib/auth"
import { SettingsContent } from "./_components/SettingsContent"

export default async function SettingsPage() {
  const locale = await getLocale()
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    redirect(`/${locale}/login`)
  }

  const { user } = session

  return (
    <SettingsContent
      user={{
        id: user.id,
        name: user.name ?? null,
        email: user.email,
        image: user.image ?? null,
        role: user.role ?? "student",
      }}
    />
  )
}
