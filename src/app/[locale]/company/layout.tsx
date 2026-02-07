import type { ReactNode } from "react"
import { Footer } from "@/components/Footer"
import { Navbar } from "@/components/Navbar"

interface CompanyLayoutProps {
  children: ReactNode
}

export default function CompanyLayout({ children }: CompanyLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}
