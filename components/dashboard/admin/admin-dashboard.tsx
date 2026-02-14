"use client"

import { AdminOverview } from "./admin-overview"
import { DepartmentsPage } from "./departments-page"
import { ManageFacultyPage } from "./manage-faculty-page"
import { AssignEvaluatorsPage } from "./assign-evaluators-page"
import { EvaluationCriteriaPage } from "./evaluation-criteria-page"
import { AllEvaluationsPage } from "./all-evaluations-page"
import { ReportsPage } from "./reports-page"

interface AdminDashboardProps {
  currentPage: string
}

export function AdminDashboard({ currentPage }: AdminDashboardProps) {
  switch (currentPage) {
    case "dashboard":
      return <AdminOverview />
    case "departments":
      return <DepartmentsPage />
    case "manage-faculty":
      return <ManageFacultyPage />
    case "assign-evaluators":
      return <AssignEvaluatorsPage />
    case "evaluation-criteria":
      return <EvaluationCriteriaPage />
    case "all-evaluations":
      return <AllEvaluationsPage />
    case "reports":
      return <ReportsPage />
    default:
      return <AdminOverview />
  }
}
