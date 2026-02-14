"use client"

import React from "react"

import type { Role } from "@/lib/dummy-data"
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
} from "lucide-react"

interface SidebarProps {
  role: Role
  currentPage: string
  onNavigate: (page: string) => void
}

interface NavItem {
  id: string
  label: string
  icon: React.ReactNode
}

const adminNav: NavItem[] = [
  { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard className="h-5 w-5" /> },
  { id: "departments", label: "Departments", icon: <Building2 className="h-5 w-5" /> },
  { id: "manage-faculty", label: "Manage Faculty", icon: <Users className="h-5 w-5" /> },
  { id: "assign-evaluators", label: "Assign Evaluators", icon: <UserCheck className="h-5 w-5" /> },
  { id: "evaluation-criteria", label: "Evaluation Criteria", icon: <ClipboardList className="h-5 w-5" /> },
  { id: "all-evaluations", label: "All Evaluations", icon: <FileText className="h-5 w-5" /> },
  { id: "reports", label: "Reports & Analytics", icon: <BarChart3 className="h-5 w-5" /> },
]

const facultyNav: NavItem[] = [
  { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard className="h-5 w-5" /> },
  { id: "profile", label: "My Profile", icon: <User className="h-5 w-5" /> },
  { id: "self-evaluation", label: "Self Evaluation", icon: <ClipboardList className="h-5 w-5" /> },
  { id: "upload-documents", label: "Upload Documents", icon: <Upload className="h-5 w-5" /> },
  { id: "evaluation-status", label: "Evaluation Status", icon: <CheckCircle className="h-5 w-5" /> },
  { id: "feedback", label: "View Feedback", icon: <MessageSquare className="h-5 w-5" /> },
]

const evaluatorNav: NavItem[] = [
  { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard className="h-5 w-5" /> },
  { id: "assigned-faculty", label: "Assigned Faculty", icon: <Users className="h-5 w-5" /> },
  { id: "review-submissions", label: "Review Submissions", icon: <FileText className="h-5 w-5" /> },
  { id: "score-comment", label: "Score & Comment", icon: <Star className="h-5 w-5" /> },
  { id: "final-evaluation", label: "Final Evaluation", icon: <Send className="h-5 w-5" /> },
]

export function DashboardSidebar({ role, currentPage, onNavigate }: SidebarProps) {
  const navItems = role === "admin" ? adminNav : role === "faculty" ? facultyNav : evaluatorNav
  const roleLabel = role === "admin" ? "Administrator" : role === "faculty" ? "Faculty" : "Evaluator"

  return (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      {/* Logo area */}
      <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sidebar-primary">
          <GraduationCap className="h-5 w-5 text-sidebar-primary-foreground" />
        </div>
        <div className="flex flex-col">
          <span className="font-display text-sm font-semibold text-sidebar-foreground">FPES</span>
          <span className="text-xs text-sidebar-foreground/60">{roleLabel}</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label="Sidebar navigation">
        <ul className="flex flex-col gap-1">
          {navItems.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => onNavigate(item.id)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  currentPage === item.id
                    ? "bg-sidebar-accent text-sidebar-primary"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                )}
              >
                {item.icon}
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer */}
      <div className="border-t border-sidebar-border p-4">
        <p className="text-xs text-sidebar-foreground/50">Faculty Performance</p>
        <p className="text-xs text-sidebar-foreground/50">Evaluation System v1.0</p>
      </div>
    </div>
  )
}
