"use client"

import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { DashboardSidebar } from "./dashboard-sidebar"
import { AdminDashboard } from "./admin/admin-dashboard"
import { FacultyDashboard } from "./faculty/faculty-dashboard"
import { EvaluatorDashboard } from "./evaluator/evaluator-dashboard"
import { Button } from "@/components/ui/button"
import { Menu, LogOut, Bell } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

export function DashboardShell() {
  const { user, logout } = useAuth()
  const [currentPage, setCurrentPage] = useState("dashboard")
  const [sidebarOpen, setSidebarOpen] = useState(false)

  if (!user) return null

  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-foreground/20 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
          onKeyDown={(e) => e.key === "Escape" && setSidebarOpen(false)}
          role="button"
          tabIndex={0}
          aria-label="Close sidebar"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 transform transition-transform duration-200 ease-in-out lg:relative lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <DashboardSidebar
          role={user.role}
          currentPage={currentPage}
          onNavigate={(page) => {
            setCurrentPage(page)
            setSidebarOpen(false)
          }}
        />
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex h-16 items-center justify-between border-b border-border bg-card px-4 lg:px-6">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open sidebar"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="hidden lg:block">
            <h2 className="font-display text-lg font-semibold capitalize text-foreground">
              {currentPage.replace(/-/g, " ")}
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
              <Bell className="h-5 w-5 text-muted-foreground" />
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-accent" />
            </Button>
            <div className="hidden items-center gap-2 sm:flex">
              <Avatar className="h-8 w-8 bg-primary text-primary-foreground">
                <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-foreground">{user.name}</span>
                <span className="text-xs capitalize text-muted-foreground">{user.role}</span>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={logout}
              aria-label="Sign out"
              className="text-muted-foreground hover:text-destructive"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {user.role === "admin" && <AdminDashboard currentPage={currentPage} />}
          {user.role === "faculty" && <FacultyDashboard currentPage={currentPage} />}
          {user.role === "evaluator" && <EvaluatorDashboard currentPage={currentPage} />}
        </main>
      </div>
    </div>
  )
}
