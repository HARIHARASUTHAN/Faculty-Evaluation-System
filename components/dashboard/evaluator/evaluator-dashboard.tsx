"use client"

import { EvaluatorOverview } from "./evaluator-overview"
import { AssignedFacultyPage } from "./assigned-faculty-page"
import { ReviewSubmissionsPage } from "./review-submissions-page"
import { ScoreCommentPage } from "./score-comment-page"
import { FinalEvaluationPage } from "./final-evaluation-page"

export function EvaluatorDashboard({ currentPage }: { currentPage: string }) {
  switch (currentPage) {
    case "dashboard":
      return <EvaluatorOverview />
    case "assigned-faculty":
      return <AssignedFacultyPage />
    case "review-submissions":
      return <ReviewSubmissionsPage />
    case "score-comment":
      return <ScoreCommentPage />
    case "final-evaluation":
      return <FinalEvaluationPage />
    default:
      return <EvaluatorOverview />
  }
}
