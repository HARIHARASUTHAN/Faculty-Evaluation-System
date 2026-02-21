"use client"

import React from "react"
import type { Role } from "@/lib/auth-context"
import { cn } from "@/lib/utils"
import {
  GraduationCap,
  LayoutDashboard,
  Building2,
  Users,
  UserCheck,
  ClipboardList,
  BarChart3,
  FileText,
  User,
  Upload,
  CheckCircle,
  MessageSquare,
  Star,
  Send,
  Sparkles,
  CalendarClock,
  ShieldCheck,
  FolderSearch,
  History,
  Download,
  TrendingUp,
  Lock,
} from "lucide-react"

interface SidebarProps {
  role: Role
  currentPage: string
  onNavigate: (page: string) => void
  userName: string
  userRole: Role
}

interface NavItem {
  id: string
  label: string
  icon: React.ReactNode
  section?: string
}

const adminNav: NavItem[] = [
  { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard className="h-4.5 w-4.5" />, section: "Overview" },
  { id: "departments", label: "Departments", icon: <Building2 className="h-4.5 w-4.5" />, section: "Management" },
  { id: "manage-faculty", label: "Manage Faculty", icon: <Users className="h-4.5 w-4.5" /> },
  { id: "assign-hod", label: "Assign HOD", icon: <UserCheck className="h-4.5 w-4.5" /> },
  { id: "evaluation-cycles", label: "Evaluation Cycles", icon: <CalendarClock className="h-4.5 w-4.5" />, section: "Evaluation" },
  { id: "kpi-categories", label: "KPI Categories", icon: <ClipboardList className="h-4.5 w-4.5" /> },
  { id: "all-evaluations", label: "All Evaluations", icon: <FileText className="h-4.5 w-4.5" /> },
  { id: "reports", label: "Reports & Analytics", icon: <BarChart3 className="h-4.5 w-4.5" />, section: "Reports" },
  { id: "audit-logs", label: "Audit Logs", icon: <ShieldCheck className="h-4.5 w-4.5" /> },
]

const hodNav: NavItem[] = [
  { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard className="h-4.5 w-4.5" />, section: "Overview" },
  { id: "department-faculty", label: "Department Faculty", icon: <Users className="h-4.5 w-4.5" />, section: "Evaluation" },
  { id: "review-documents", label: "Review Documents", icon: <FolderSearch className="h-4.5 w-4.5" /> },
  { id: "evaluate-documents", label: "Evaluate & Score", icon: <Star className="h-4.5 w-4.5" /> },
  { id: "final-evaluation", label: "Final Evaluation", icon: <Send className="h-4.5 w-4.5" /> },
  { id: "evaluation-history", label: "History", icon: <History className="h-4.5 w-4.5" />, section: "Records" },
]

const facultyNav: NavItem[] = [
  { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard className="h-4.5 w-4.5" />, section: "Overview" },
  { id: "upload-documents", label: "Upload Documents", icon: <Upload className="h-4.5 w-4.5" />, section: "Documents" },
  { id: "my-documents", label: "My Documents", icon: <FileText className="h-4.5 w-4.5" /> },
  { id: "evaluation-results", label: "Evaluation Results", icon: <TrendingUp className="h-4.5 w-4.5" />, section: "Results" },
  { id: "profile", label: "My Profile", icon: <User className="h-4.5 w-4.5" /> },
]

export function DashboardSidebar({ role, currentPage, onNavigate, userName, userRole }: SidebarProps) {
  const navItems = role === "admin" ? adminNav : role === "hod" ? hodNav : facultyNav
  const roleLabel = role === "admin" ? "Administrator" : role === "hod" ? "Head of Dept" : "Faculty Member"

  return (
    <div className="flex h-full flex-col bg-sidebar border-r border-sidebar-border">
      {/* Logo area */}
      <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent shadow-md shadow-primary/20">
          <GraduationCap className="h-5 w-5 text-white" />
        </div>
        <div className="flex flex-col">
          <span className="font-display text-sm font-bold text-sidebar-foreground tracking-wide">FDES</span>
          <span className="text-[10px] uppercase tracking-widest text-sidebar-foreground/40 font-medium">
            {roleLabel}
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-5" aria-label="Sidebar navigation">
        <ul className="flex flex-col gap-0.5">
          {navItems.map((item, idx) => {
            const isActive = currentPage === item.id
            return (
              <React.Fragment key={item.id}>
                {item.section && (
                  <li className={idx > 0 ? "mt-5" : ""}>
                    <p className="mb-2 px-3 text-[10px] uppercase tracking-widest text-sidebar-foreground/30 font-semibold">
                      {item.section}
                    </p>
                  </li>
                )}
                <li>
                  <button
                    type="button"
                    onClick={() => onNavigate(item.id)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                      isActive
                        ? "bg-sidebar-primary/10 text-sidebar-primary shadow-sm shadow-sidebar-primary/5 sidebar-active"
                        : "text-sidebar-foreground/60 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
                    )}
                  >
                    <span className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-lg transition-colors",
                      isActive
                        ? "bg-sidebar-primary/15 text-sidebar-primary"
                        : "text-sidebar-foreground/50"
                    )}>
                      {item.icon}
                    </span>
                    {item.label}
                    {isActive && (
                      <Sparkles className="ml-auto h-3 w-3 text-sidebar-primary/60" />
                    )}
                  </button>
                </li>
              </React.Fragment>
            )
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="border-t border-sidebar-border p-4">
        <div className="rounded-xl bg-sidebar-accent/40 p-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent text-white text-xs font-bold">
              {userName.split(" ").map(n => n[0]).join("").slice(0, 2)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-sidebar-foreground truncate">{userName}</p>
              <p className="text-[10px] text-sidebar-foreground/40 capitalize">{userRole === "hod" ? "HOD" : userRole}</p>
            </div>
          </div>
        </div>
        <p className="mt-3 text-center text-[10px] text-sidebar-foreground/25">
          FDES v2.0 • Powered by Firebase
        </p>
      </div>
    </div>
  )
}
