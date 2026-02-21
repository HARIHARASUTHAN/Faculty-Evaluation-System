"use client"

import { HodOverview } from "./hod-overview"
import { DepartmentFacultyPage } from "./department-faculty-page"
import { ReviewDocumentsPage } from "./review-documents-page"
import { EvaluateDocumentsPage } from "./evaluate-documents-page"
import { HodFinalEvaluationPage } from "./hod-final-evaluation-page"
import { EvaluationHistoryPage } from "./evaluation-history-page"

export function HodDashboard({ currentPage }: { currentPage: string }) {
    switch (currentPage) {
        case "department-faculty": return <DepartmentFacultyPage />
        case "review-documents": return <ReviewDocumentsPage />
        case "evaluate-documents": return <EvaluateDocumentsPage />
        case "final-evaluation": return <HodFinalEvaluationPage />
        case "evaluation-history": return <EvaluationHistoryPage />
        default: return <HodOverview />
    }
}
