"use client"

import { AdminOverview } from "./admin-overview"
import { DepartmentsPage } from "./departments-page"
import { ManageFacultyPage } from "./manage-faculty-page"
import { AssignHodPage } from "./assign-hod-page"
import { EvaluationCyclesPage } from "./evaluation-cycles-page"
import { KpiCategoriesPage } from "./kpi-categories-page"
import { AllEvaluationsPage } from "./all-evaluations-page"
import { ReportsPage } from "./reports-page"
import { AuditLogsPage } from "./audit-logs-page"

export function AdminDashboard({ currentPage }: { currentPage: string }) {
  switch (currentPage) {
    case "departments": return <DepartmentsPage />
    case "manage-faculty": return <ManageFacultyPage />
    case "assign-hod": return <AssignHodPage />
    case "evaluation-cycles": return <EvaluationCyclesPage />
    case "kpi-categories": return <KpiCategoriesPage />
    case "all-evaluations": return <AllEvaluationsPage />
    case "reports": return <ReportsPage />
    case "audit-logs": return <AuditLogsPage />
    default: return <AdminOverview />
  }
}
