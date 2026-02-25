"use client"

import { useState } from "react"
import { useTheme } from "next-themes"
import { useAuth } from "@/lib/auth-context"
import { DashboardSidebar } from "./dashboard-sidebar"
import { AdminDashboard } from "./admin/admin-dashboard"
import { FacultyDashboard } from "./faculty/faculty-dashboard"
import { HodDashboard } from "./hod/hod-dashboard"
import { Button } from "@/components/ui/button"
import { Menu, LogOut, Sun, Moon } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

export function DashboardShell() {
  const { user, logout } = useAuth()
  const { theme, setTheme } = useTheme()
  const [currentPage, setCurrentPage] = useState("dashboard")
  const [sidebarOpen, setSidebarOpen] = useState(false)

  if (!user) return null

  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)

  const pageTitle = currentPage.replace(/-/g, " ")

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Background gradient orbs */}
      <div className="bg-gradient-orb bg-gradient-orb-1" />
      <div className="bg-gradient-orb bg-gradient-orb-2" />

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm lg:hidden animate-fade-in"
          onClick={() => setSidebarOpen(false)}
          onKeyDown={(e) => e.key === "Escape" && setSidebarOpen(false)}
          role="button"
          tabIndex={0}
          aria-label="Close sidebar"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-72 transform transition-transform duration-300 ease-out lg:relative lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        <DashboardSidebar
          role={user.role}
          currentPage={currentPage}
          onNavigate={(page) => {
            setCurrentPage(page)
            setSidebarOpen(false)
          }}
          userName={user.name}
          userRole={user.role}
        />
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden relative z-10">
        {/* Top bar */}
        <header className="flex h-16 items-center justify-between border-b border-border bg-card/50 backdrop-blur-lg px-4 lg:px-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden hover:bg-secondary"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open sidebar"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div className="hidden lg:block">
              <h2 className="font-display text-lg font-semibold capitalize text-foreground">
                {pageTitle}
              </h2>
            </div>
          </div>


          <div className="flex items-center gap-2">

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="hover:bg-secondary"
              aria-label="Toggle theme"
            >
              <Sun className="h-5 w-5 text-muted-foreground rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-5 w-5 text-muted-foreground rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </Button>

            <div className="hidden items-center gap-3 sm:flex ml-2 pl-3 border-l border-border">
              <Avatar className="h-8 w-8 ring-2 ring-primary/20">
                <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white text-xs font-medium">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-foreground leading-tight">{user.name}</span>
                <span className="text-xs capitalize text-muted-foreground">{user.role === "hod" ? "HOD" : user.role}</span>
              </div>
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={logout}
              aria-label="Sign out"
              className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 ml-1"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <div className="animate-fade-in-up">
            {user.role === "admin" && <AdminDashboard currentPage={currentPage} />}
            {user.role === "faculty" && <FacultyDashboard currentPage={currentPage} />}
            {user.role === "hod" && <HodDashboard currentPage={currentPage} />}
          </div>
        </main>
      </div>
    </div>
  )
}
