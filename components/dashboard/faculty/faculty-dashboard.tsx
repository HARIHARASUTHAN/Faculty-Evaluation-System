"use client"

import { FacultyOverview } from "./faculty-overview"
import { UploadDocumentsPage } from "./upload-documents-page"
import { MyDocumentsPage } from "./my-documents-page"
import { EvaluationResultsPage } from "./evaluation-results-page"
import { ProfilePage } from "./profile-page"

export function FacultyDashboard({ currentPage }: { currentPage: string }) {
  switch (currentPage) {
    case "upload-documents": return <UploadDocumentsPage />
    case "my-documents": return <MyDocumentsPage />
    case "evaluation-results": return <EvaluationResultsPage />
    case "profile": return <ProfilePage />
    default: return <FacultyOverview />
  }
}
