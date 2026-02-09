"use client"

import { useState, createContext, useContext } from "react"
import { DashboardSidebar } from "./DashboardSidebar"
import { DashboardNavbar } from "./DashboardNavbar"

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
}: {
  children: React.ReactNode
  user: { name: string | null; email: string; role: string | null | undefined }
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  return (
    <DashboardContext.Provider value={{ isSidebarOpen, setIsSidebarOpen }}>
      {/* Background with a subtle gradient/texture to make cards pop */}
      <div className="flex min-h-screen bg-[#F9F9F8] dark:bg-background text-foreground transition-colors duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] selection:bg-primary/10 selection:text-primary">
        
        {/* Desktop Sidebar */}
        <div className="hidden lg:block shrink-0 border-e border-border/40 bg-white dark:bg-card">
          <DashboardSidebar role={user.role as string} />
        </div>

        {/* Mobile Sidebar (Overlay) */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 z-40 bg-heading/20 backdrop-blur-sm lg:hidden transition-all duration-500 animate-in fade-in"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
        <div className={`fixed inset-y-0 start-0 z-50 lg:hidden transform transition-all duration-500 ease-[cubic-bezier(0.4,1,0.2,1)] ${isSidebarOpen ? "translate-x-0 opacity-100" : "-translate-x-full opacity-0"}`}>
           <div className="bg-white dark:bg-background h-full shadow-2xl">
              <DashboardSidebar role={user.role as string} />
           </div>
        </div>
        
        <div className="flex-1 flex flex-col min-w-0 min-h-screen relative overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full pointer-events-none -translate-y-1/2 translate-x-1/2" />
          
          <DashboardNavbar user={user} />
          
          <main className="flex-1 p-4 sm:p-6 lg:p-10 lg:pt-8 overflow-y-auto w-full max-h-[calc(100vh-80px)] scroll-smooth custom-scrollbar">
            <div className="max-w-7xl mx-auto w-full pb-10">
               {children}
            </div>
          </main>
        </div>
      </div>
    </DashboardContext.Provider>
  )
}
