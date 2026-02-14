"use client"

import { FacultyOverview } from "./faculty-overview"
import { ProfilePage } from "./profile-page"
import { SelfEvaluationPage } from "./self-evaluation-page"
import { UploadDocumentsPage } from "./upload-documents-page"
import { EvaluationStatusPage } from "./evaluation-status-page"
import { FeedbackPage } from "./feedback-page"

interface FacultyDashboardProps {
  currentPage: string
}

export function FacultyDashboard({ currentPage }: FacultyDashboardProps) {
  switch (currentPage) {
    case "dashboard":
      return <FacultyOverview />
    case "profile":
      return <ProfilePage />
    case "self-evaluation":
      return <SelfEvaluationPage />
    case "upload-documents":
      return <UploadDocumentsPage />
    case "evaluation-status":
      return <EvaluationStatusPage />
    case "feedback":
      return <FeedbackPage />
    default:
      return <FacultyOverview />
  }
}
