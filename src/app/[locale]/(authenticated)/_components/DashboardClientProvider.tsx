"use client"

import { createContext, useContext, useState } from "react"
import { DashboardNavbar } from "@/app/[locale]/(authenticated)/_components/DashboardNavbar"
import { DashboardSidebar } from "@/app/[locale]/(authenticated)/_components/DashboardSidebar"
import { ImpersonationBanner } from "@/components/ImpersonationBanner"

const DashboardContext = createContext<{
  isSidebarOpen: boolean
  setIsSidebarOpen: (open: boolean) => void
}>({
  isSidebarOpen: false,
  setIsSidebarOpen: () => {},
})

export const useDashboard = () => useContext(DashboardContext)

export function DashboardClientProvider({
  children,
  user,
  impersonatedBy,
}: {
  children: React.ReactNode
  user: {
    id: string
    name: string | null
    email: string
    role: string | null | undefined
  }
  impersonatedBy?: string | null
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  return (
    <DashboardContext.Provider value={{ isSidebarOpen, setIsSidebarOpen }}>
      {impersonatedBy && (
        <ImpersonationBanner userName={user.name ?? user.email} />
      )}

      <div className="flex min-h-screen bg-background text-foreground transition-colors duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] selection:bg-primary/10 selection:text-primary">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block shrink-0">
          <DashboardSidebar role={user.role as string} />
        </div>

        {/* Mobile Sidebar — Overlay backdrop */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-foreground/10 backdrop-blur-sm lg:hidden transition-all duration-500 animate-in fade-in"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Mobile Sidebar — Drawer */}
        <div
          className={`fixed inset-y-0 start-0 z-50 lg:hidden transform transition-all duration-500 ease-[cubic-bezier(0.4,1,0.2,1)] ${isSidebarOpen ? "translate-x-0 opacity-100" : "-translate-x-full opacity-0"}`}
        >
          <div className="bg-background h-full shadow-2xl shadow-foreground/5">
            <DashboardSidebar role={user.role as string} />
          </div>
        </div>

        {/* Main content area */}
        <div className="flex-1 flex flex-col min-w-0 min-h-screen relative overflow-hidden">
          {/* Subtle background glow — dark mode only */}
          <div className="absolute top-0 end-0 w-[500px] h-[500px] bg-primary/3 blur-[120px] rounded-full pointer-events-none -translate-y-1/2 translate-x-1/2 opacity-0 dark:opacity-100" />

          <DashboardNavbar user={user} />

          <main className="flex-1 p-4 sm:p-6 lg:p-10 lg:pt-8 overflow-y-auto w-full max-h-[calc(100vh-80px)] scroll-smooth custom-scrollbar">
            <div className="max-w-7xl mx-auto w-full pb-10">{children}</div>
          </main>
        </div>
      </div>
    </DashboardContext.Provider>
  )
}
